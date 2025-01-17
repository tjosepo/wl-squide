---
order: 90
---

# Isolate module failures

One of the key characteristics of micro-frontends implementations like [iframes](https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaIframes) and subdomains is the ability to isolate failures within individual modules, preventing them from breaking the entire application.

However, in a [Module Federation](https://webpack.js.org/concepts/module-federation/) implementation, this is not the case as all the modules share the same browsing context (e.g. the same [Document object](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same DOM). A failure in one module can potentially breaks the entire application.

Nevertheless, an application can get very close to iframes failure isolation by utilizing React Router's [Outlet](https://reactrouter.com/en/main/components/outlet) component and the [errorElement](https://reactrouter.com/en/main/route/error-element) property of a React Router's routes.

## Create an error boundary

In the following code sample, a `RootErrorBoundary` is declared below the `RootLayout` but above the routes of the module. By doing so, if a module encounters an unhandled error, the nested error boundary will only replace the section rendered by the `Outlet` component within the `RootLayout` rather than the entire page:

```tsx host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { useRoutes } from "@squide/react-router";

export function App() {
    const areModulesReady = useAreModulesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter(routes);
    }, [routes]);

    if (!areModulesReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider router={router} />
    );
}
```

```tsx !#16 host/src/RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";

export function RootLayout() {
    const navigationItems = useNavigationItems();

    // To keep things simple, we are omitting the definition of "renderItem" and "renderSection".
    // For a full example, view: https://gsoft-inc.github.io/wl-squide/reference/routing/userenderednavigationitems/.
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>{navigationElements}</nav>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
```

```tsx !#8,12 host/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type Runtime } from "@squide/react-router";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        // Default layout.
        element: <RootLayout />,
        children: [
            {
                // Default error boundary.
                errorElement: <RootErrorBoundary />,
                children: [
                    ManagedRoutes
                ]
            }
        ]
    }, {
        hoist: true
    });
};
```

By implementing this mechanism, the level of failure isolation achieved is **comparable** to that of an **iframes** or **subdomains** implementation. With this mechanism, failure isolation **is as good as** with an **iframes** or **subdomains** implementation.

!!!warning
If your application is [hoisting pages](../reference/runtime/runtime-class.md#register-an-hoisted-route), it's important to note that they will be rendered outside of the host application's root error boundary. To prevent breaking the entire application when an hoisted page encounters unhandled errors, it is highly recommended to declare a React Router's `errorElement` property for each hoisted page.
!!!

## Try it :rocket:

Start the application in a development environment using the `dev` script. Update any of your application routes that is rendered under the newly created error boundary (e.g. that is not hoisted) and throw an `Error`. The error should be handled by the error boundary instead of breaking the whole application.

!!!info
If you are having issues with this guide, have a look at a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/shell).
!!!
