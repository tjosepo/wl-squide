---
order: 30
label: Override a React context
---

# Override a React context

In a federated application using [Module Federation](https://webpack.js.org/concepts/module-federation/), it's typical to configure various global [React contexts](https://legacy.reactjs.org/docs/context.html) at the root of the host application. These contexts are usually consumed down the line by the layouts and pages of the remote modules.

Let's take a simple example using a `BackgroundColorContext`:

```tsx !#21,23 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { useRoutes } from "@squide/react-router";
import { BackgroundColorContext } from "@sample/shared";

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
        <BackgroundColorContext.Provider value="blue">
            <RouterProvider router={router} />
        </BackgroundColorContext.Provider>
    );
}
```

```tsx !#7 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { ColoredPage } from "./ColoredPage.tsx";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        path: "/colored-page",
        element: <ColoredPage />
    });
}
```

```tsx !#4 remote-module/src/ColoredPage.tsx
import { useBackgroundColor } from "@sample/shared";

export function ColoredPage() {
    const backgroundColor = useBackgroundColor();

    return (
        <div style={{ backgroundColor }}>
            The background color is "{backgroundColor}"
        </div>
    );
}
```

In the previous code samples, the host application provides a value for the `BackgroundColorContext`, and the `ColoredPage` component of the remote module utilizes this value to set its background color (in this example, the background color is set to `blue`).

## Override the context for the remote module

Now, suppose the requirements change, and one remote module's pages need to have a `red` background. The context can be overriden for the remote module by declaring a new provider directly in the routes registration:

```tsx !#9,11 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { BackgroundColorContext } from "@sample/shared";
import { ColoredPage } from "./ColoredPage.tsx";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        path: "/colored-page",
        element: (
            <BackgroundColorContext.Provider value="red">
                <ColoredPage />
            </BackgroundColorContext.Provider>
        )
    });
}
```

### Extract an utility function

Since there are multiple routes to setup with the new provider, an utility function can be extracted:

```tsx !#6-12,17 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { BackgroundColorContext } from "@sample/shared";
import { ColoredPage } from "./ColoredPage.tsx";
import type { ReactElement } from "react";

function withRedBackground(page: ReactElement) {
    return (
        <BackgroundColorContext.Provider value="red">
            {page}
        </BackgroundColorContext.Provider>
    )
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        path: "/colored-page",
        element: withRedBackground(<ColoredPage />)
    });
}
```

## Update a singleton dependency version

Let's consider a more specific use case where the host application declares a `ThemeContext` from Workleap's new design system, Hopper:

```tsx !#21,23 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { useRoutes } from "@squide/react-router";
import { ThemeContext } from "@hopper/components";

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
        <ThemeContext.Provider value="dark">
            <RouterProvider router={router} />
        </ThemeContext.Provider>
    );
}
```

In this scenario, Hopper's components are used throughout the entire federated application, including the remote modules. Moreover, `@hopper/components` is defined as a [singleton](https://webpack.js.org/plugins/module-federation-plugin/#singleton) shared dependency:

```js !#8-10 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    sharedDependencies: {
        "@hopper/components": {
            singleton: true
        }
    }
});
```

Now, consider a situation where Hopper releases a new version of the package that includes breaking changes, without a "compatibility" package to ensure backward compatility with the previous version.

To update the host application without breaking the remote modules, the recommended approach is to temporary "break" the singleton shared dependency by loading two versions of the dependency in parallel (one for the host application and one for the remote modules that have not been updated yet).

As `@hopper/components` expose the `ThemeContext`, the context must be re-declared in each remote module until every part of the federated application has been updated to the latest version of Hopper:

```tsx !#6-12,17 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { ThemeContext } from "@hopper/components";
import { Page } from "./Page.tsx";
import type { ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeContext.Provider value="dark">
            {children}
        </ThemeContext.Provider>
    )
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        path: "/page",
        element: <Providers><Page /></Providers>
    });
}
```

Thankfully, [React Router](https://reactrouter.com/en/main) makes it very easy to declare contexts in a remote module.
