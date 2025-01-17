import { registerLocalModule } from "@endpoints/local-module";
import { isNetlify } from "@endpoints/shared";
import { registerShell } from "@endpoints/shell";
import { MswPlugin, setMswAsStarted } from "@squide/msw";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { sessionAccessor, sessionManager } from "./session.ts";

const Remotes: RemoteDefinition[] = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-endpoints-remote-module.netlify.app" : "http://localhost:8081"
    }
];

// Add a plugin to support Mock Service Worker for a federated application.
// The plugin will help collect the request handlers from every module.
const mswPlugin = new MswPlugin();

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    plugins: [mswPlugin],
    sessionAccessor
});

await registerLocalModules([registerShell(sessionManager, { host: "@endpoints/host" }), registerHost, registerLocalModule], runtime);

await registerRemoteModules(Remotes, runtime);

if (process.env.USE_MSW) {
    // Files including an import to the "msw" package are included dynamically to prevent adding
    // MSW stuff to the bundled when it's not used.
    const startMsw = (await import("../mocks/browser.ts")).startMsw;

    // Will start MSW with the request handlers provided by every module.
    startMsw(mswPlugin.requestHandlers);

    // Indicate to resources that are dependent on MSW that the service has been started.
    setMswAsStarted();
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);
