---
order: 60
---

# Develop a module in isolation

To develop their own independent module, a team **shouldn't be required to install the host application** or any **other modules** of the application **that they do not own**. However, they should have a means to integrate their module with the application shell (`RootLayout`, `RootErrorBoundary`, etc..) while working on their module in isolation.

To achieve this, the first step is to extract the application shell from the host application. There are several approaches to accomplish this, but in this guide, we'll transform the host application into a monorepo and introduce a new local package named `@sample/shell` for this purpose:

``` !#4
host
├── app
├── packages
├────── shell
├───────── src
├─────────── RootLayout.tsx
├─────────── RootErrorBoundary.tsx
├─────────── AppRouter.ts
├─────────── register.tsx
├─────────── index.ts
├───────── package.json
├───────── tsup.dev.ts
├───────── tsup.build.ts
```

## Create a shell package

> The implementation details of the `RootLayout` and `RootErrorBoundary` won't be covered by this guide as it already has been covered many times by other guides.

First, create a new package (we'll refer to ours as `shell`) and add the following fields to the `package.json` file:

```json shell/package.json
{
    "name": "@sample/shell",
    "version": "0.0.1",
    "type": "module",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "types": "./dist/index.d.ts",
            "default": "./dist/index.js"
        }
    }
}
```

Then, install the package dependencies and configure the new package with [tsup](https://gsoft-inc.github.io/wl-web-configs/tsup/).

Then, create a `AppRouter` component in the shell package to provide a **reusable router configuration** that can be utilized by both the host application and the isolated modules.

```tsx shell/src/AppRouter.tsx
import { useRoutes } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function AppRouter() {
    const routes = useRoutes();

    // Re-render the app once all the remotes are registered, otherwise the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

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

Finally, create a local module to register the **application shell** that will also be utilized by the host application and the isolated modules:

```tsx shell/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type Runtime } from "@squide/react-router";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export const registerShell: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            {
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

!!!info
This guide only covers the `RootLayout` and `RootErrorBoundary` but the same goes for other shell assets such as an `AuthenticationBoundary`.
!!!

## Update the host application

Now, let's revisit the host application by first adding a dependency to the new `@sample/shell` package:

```json host/package.json
{
    "dependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

Then, incorporate the newly introduced `AppRouter` component:

```tsx host/src/App.tsx
import { AppRouter } from "@sample/shell";

export function App() {
    return <AppRouter />
}
```

And the `registerShell` function to setup the `RootLayout`, the `RootErrorBoundary` and any other shell assets:

```tsx !#22 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import type { AppContext} from "@sample/shared";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { registerShell } from "@sample/shell";

const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

const context: AppContext = {
    name: "Demo application"
};

// Register the shell module.
await registerLocalModules([registerShell, registerHost], runtime, { context });

await registerRemoteModules(Remotes, runtime, { context });

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Setup a remote module

With the new `shell` package in place, we can now configure the remote module to be developed in isolation. The goal is to start the module development server and render the module pages with the same layout and functionalities as if it was rendered by the host application.

To begin, let's start by adding a dependency to the `@sample/shell` package:

```json remote-module/package.json
{
    "dependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

Then, create the following files in the remote module application:

``` !#2-3,5-7,10-11
remote-module
├── public
├──── index.html
├── src
├────── dev
├────────── DevHome.tsx
├────────── register.tsx
├────── register.tsx
├────── Page.tsx
├────── index.tsx
├────── App.tsx
├── webpack.dev.js
├── package.json
```

### index.tsx

The `index.tsx` file is similar to the `bootstrap.tsx` file of an host application but, tailored for an isolated module. The key distinctions are that, since the project is set up for isolated development, the module is registered with the [registerLocalModules](/reference/registration/registerLocalModules.md) function instead of the [registerRemoteModules](/reference/registration/registerRemoteModules.md) function, and a new `registerDev` function is introduced to register the development homepage (which will be covered in an upcoming section):

```tsx !#10-12,16 remote-module/src/index.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime, registerLocalModules } from "@squide/react-router";
import { App } from "./App.tsx";
import { register as registerModule } from "./register.tsx";
import { registerDev } from "./dev/register.tsx";
import { registerShell } from "@sample/shell";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

// Registering the remote module as a static module because the "register" function 
// is local when developing in isolation.
await registerLocalModules([registerModule, registerDev, registerShell], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### App.tsx

The `App.tsx` file uses the newly created `AppRouter` component to setup [React Router](https://reactrouter.com/):

```tsx remote-module/src/App.tsx
import { AppRouter } from "@sample/shell";

export function App() {
    return <AppRouter />;
}
```

### DevHome.tsx

The `DevHome` component purpose is strictly to serve as an `index` page when developing the remote module in isolation.

```tsx remote-module/src/dev/DevHome.tsx
function DevHome() {
    return (
        <div>
            <h2>Remote module development home page</h2>
            <p>Hey!</p>
        </div>
    );
}
```

To register the development homepage, let's create a new local module specifically for registering what is needed to develop the module in isolation:

```tsx remote-module/src/dev/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { DevHome } from "./DevHome.tsx";

export const registerDev: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHome />
    });
}
```

### Add a new CLI script

Next, add a new `dev-isolated` script to the `package.json` file to start the local development server in **"isolation"**:

```json !#3 remote-module/package.json
{
    "dev": "webpack serve --config webpack.dev.js",
    "dev-isolated": "cross-env ISOLATED=true webpack serve --config webpack.dev.js",
}
```

The `dev-isolated` script is similar to the `dev` script but introduces a `ISOLATED` environment variable. This new environment variable will be utilized by the `webpack.dev.js` file to conditionally setup the development server for development in **isolation** or to be consumed by a host application through the `/remoteEntry.js` entry point:

### Configure webpack

!!!info
If you are having issues configuring webpack, refer to the [@workleap/webpack-configs](https://gsoft-inc.github.io/wl-web-configs/webpack/) documentation website.
!!!

First, open the `public/index.html` file created at the beginning of this guide and copy/paste the following [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) template:

```html host/public/index.html
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```

Then, open the `.browserslist` file and copy/paste the following content:

``` host/.browserslistrc
extends @workleap/browserslist-config
```

#### `defineDevConfig`

To configure webpack, open the `webpack.dev.js` file and update the configuration to incorporate the `ISOLATED` environment variable and the [defineDevConfig](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/) function:

```js !#9,12 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.ISOLATED) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081);
} else {
    config = defineDevConfig(swcConfig);
}

export default config;
```

### Try it :rocket:

Start the remote module in isolation by running the `dev-isolated` script. The application shell should wrap the pages of the module and the default page should be `DevHome`.

## Setup a local module

Similarly to remote modules, the same isolated setup can be achieved for local modules. The main difference is that the `webpack.config.js` file of a local module serves the sole purpose of starting a development server for isolated development. Typically, local modules do not rely on webpack and [Module Federation](https://webpack.js.org/concepts/module-federation/).

First, open a terminal at the root of the local module application and install the `@workleap/webpack-configs` package and its dependencies:

+++ pnpm
```bash
pnpm add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++ yarn
```bash
yarn add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++ npm
```bash
npm install -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

Then, create the following files in the local module application:

``` !#2-3,5-7,10-11
local-module
├── public
├────── index.html
├── src
├────── dev
├────────── DevHome.tsx
├────────── register.tsx
├────── register.tsx
├────── Page.tsx
├────── index.tsx
├────── App.tsx
├── .browserslistrc
├── swc.config.js
├── webpack.config.js
├── package.json
```

### index.tsx

This file is similar to the `index.tsx` file of the [remote module](#indextsx).

### App.tsx

This file is similar to the `App.tsx` file of the [remote module](#apptsx).

### DevHome.tsx & registerDev

These files are similar to the `dev/DevHome.tsx` and `dev/register.tsx` files of the [remote module](#devhometsx).

### Configure webpack

!!!info
If you are having issues configuring webpack, refer to the [@workleap/webpack-configs](https://gsoft-inc.github.io/wl-web-configs/webpack/) documentation website.
!!!

First, open the `public/index.html` file and copy/paste the following [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) template:

```html local-module/public/index.html
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```

Then, open the `.browserslist` file and copy/paste the following content:

``` local-module/.browserslistrc
extends @workleap/browserslist-config
```

Then, open the `swc.config.js` file and copy/paste the following code:

```js local-module/swc.config.js
// @ts-check

import { browserslistToSwc, defineDevConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

export const swcConfig = defineDevConfig(targets);
```

Finally, open the `webpack.config.js` file and use the the [defineDevConfig](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/) function to configure webpack:

```js local-module/webpack.config.js
// @ts-check

import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.config.js";

export default defineDevConfig(swcConfig);
```

### Add a new CLI script

Next, add a new `dev-isolated` script to the `package.json` file to start the local development server:

```json local-module/package.json
{
    "dev-isolated": "webpack serve --config webpack.config.js"
}
```

### Try it :rocket:

Start the remote module in isolation by running the `dev-isolated` script. The application shell should wrap the pages of the module and the default page should be `DevHome`.

!!!info
If you are having issues with this guide, have a look at a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic).
!!!
