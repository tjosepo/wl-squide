---
order: 80
---

# Create a local module

Local modules are regular modules that are part of the **host application build**. They are independent modules that expose a `registration` function to the host application's bootstrapping code. A local module can be a standalone package, a sibling project (in a monorepo setup), or even a local folder within the host application.

Local modules are useful when **migrating** from a **monolithic application** to a distributed application or when **launching** a **new product** with an unrefined business domain.

Let's add a local module to demonstrate how it's done!

> Loading remote modules at runtime with [Module Federation](https://webpack.js.org/concepts/module-federation/) is the primary focus of this shell and our recommended approach. It empowers teams to be **fully autonomous** by **deploying** their modules **independently** from the other parts of the application.
>
> However, we recognize that teams working on mature products may prefer to **gradually migrate** to a distributed architecture by first extracting subdomains into independent modules within their current monolithic setup before fully committing to remote modules loaded at runtime.
>
> To facilitate this transition, this shell also supports local modules that are loaded at **build time**.
>
> Both remote and local modules can be used within same application as this shell supports dual bootstrapping. For example, an application can be configured to load a few remote modules at runtime while also loading a few local modules.

## Install the packages

Create a new application (we'll refer to ours as `local-module`), then open a terminal at the root of the new solution and install the following packages:

+++ pnpm
```bash
pnpm add -D @workleap/tsup-configs tsup typescript
pnpm add @squide/core @squide/react-router react react-dom react-router-dom
```
+++ yarn
```bash
pnpm add -D @workleap/tsup-configs tsup typescript
yarn add @squide/core @squide/react-router react react-dom react-router-dom
```
+++ npm
```bash
pnpm add -D @workleap/tsup-configs tsup typescript
npm install @squide/core @squide/react-router react react-dom react-router-dom
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommend that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

## Setup the application

First, create the following files:

```
local-modules
├── src
├──── register.tsx
├──── Page.tsx
├── tsup.dev.ts
├── tsup.build.ts
├── package.json
```

Then, ensure that you are developing your module using [ESM syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) by specifying `type: module` in your `package.json` file:

```json local-module/package.json
{
    "type": "module"
}
```

Finally, configure the package to be shareable by adding the `name`, `version`, and `export` fields to the `package.json` file:

```json local-module/package.json
{
    "name": "@sample/local-module",
    "version": "0.0.1",
    "exports": {
        ".": {
            "import": "./dist/register.js",
            "types": "./dist/register.d.ts",
            "default": "./dist/register.js"
        }
    }
}
```

### Routes registration

Next, register the local module routes and navigation items with [registerRoute](/reference/runtime/runtime-class.md#register-routes) and [registerNavigationItem](/reference/runtime/runtime-class.md#register-navigation-items) functions:

```tsx !#6-9,11-14 local-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<Runtime, AppContext> = (runtime, context) => {
    runtime.registerRoute({
        path: "/local/page",
        element: <Page />
    });

    runtime.registerNavigationItem({
        $label: "Local/Page",
        to: "/local/page"
    });
}
```

Then, create the `<Page>` component:

```tsx local-module/src/Page.tsx
export function Page() {
    return (
        <div>Hello from Local/Page!</div>
    );
}
```

## Register the local module

Go back to the `host` application add a dependency to the `@sample/local-module` package in the host application `package.json` file:

```json host/package.json
{
    "dependencies": {
        "@sample/local-module": "0.0.1"
    }
}
```

Then, register the local module with the [registerLocalModule](/reference/registration/registerLocalModules.md) function:

```tsx !#5,27 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import type { AppContext } from "@sample/shared";
import { register as registerLocalModule } from "@sample/local-module";
import { App } from "./App.tsx";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

// Create the shell runtime.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

// Create an optional context.
const context: AppContext = {
    name: "Demo application"
};

// Register the remote module.
await registerRemoteModules(Remotes, runtime, context);

// Register the local module.
registerLocalModule([registerLocalModule], runtime, context);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Configure tsup

!!!info
If you are having issues with the tsup configuration, refer to the [@workleap/tsup-configs documentation](https://gsoft-inc.github.io/wl-web-configs/tsup).
!!!

### Development configuration

To configure tsup for a **development** environment, open the `tsup.dev.ts` file and copy/paste the following code:

```ts local-module/tsup.dev.ts
import { defineDevConfig } from "@workleap/tsup-configs";

export default defineDevConfig();
```

### Build configuration

To configure tsup for a **build** environment, open the `tsup.build.ts` file and copy/paste the following code:

```ts local-module/tsup.build.ts
import { defineBuildConfig } from "@workleap/tsup-configs";

export default defineBuildConfig();
```

## Add CLI scripts

To initiate the development server, add the following script to the application `package.json` file:

```json local-module/package.json
{
    "dev": "tsup --config ./tsup.dev.ts"
}
```

To build the module, add the following script to the application `package.json` file:

```json local-module/package.json
{
    "build": "tsup --config ./tsup.build.ts"
}
```

## Try it :rocket:

Start the `host`, `remote-module` and `local-module` applications in development mode using the `dev` script. You should now notice an additional link in the navigation menu. Click on the link to navigate to the page of your new **local** module!

!!!info
To troubleshoot module registration issues, open the DevTools console. You'll find a log entry for each registration that occurs and error messages if something goes wrong.
!!!

!!!info
If you are having issues with this guide, have a look at a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/local-module).
!!!
