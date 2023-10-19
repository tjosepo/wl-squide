import type { SessionManager } from "@endpoints/shared";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { ManagedRoutes } from "@squide/react-router";
import { authenticationHandlers } from "../mocks/authenticationHandlers.ts";
import { subscriptionHandlers } from "../mocks/subscriptionHandlers.ts";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

export interface RegisterShellOptions {
    // This is only for demo purposed, do not copy this.
    host?: string;
}

function registerRoutes(runtime: Runtime, sessionManager: SessionManager, host?: string) {
    runtime.registerRoute({
        // Pathless route to declare a root layout and a root error boundary.
        $visibility: "public",
        element: <RootLayout />,
        children: [
            {
                // Public pages like the login and logout pages will be rendered under this pathless route.
                $visibility: "public",
                $name: "root-error-boundary",
                errorElement: <RootErrorBoundary />,
                children: [
                    {
                        // Pathless route to declare an authenticated boundary.
                        lazy: () => import("./AuthenticationBoundary.tsx"),
                        children: [
                            {
                                // Pathless route to declare an authenticated layout.
                                lazy: async () => {
                                    const { AuthenticatedLayout } = await import("./AuthenticatedLayout.tsx");

                                    return {
                                        element: <AuthenticatedLayout sessionManager={sessionManager} />
                                    };
                                },
                                children: [
                                    {
                                        // Pathless route to declare an error boundary inside the layout instead of outside.
                                        // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                                        lazy: () => import("./ModuleErrorBoundary.tsx"),
                                        children: [
                                            ManagedRoutes
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }, {
        hoist: true
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "/login",
        lazy: async () => {
            const { LoginPage } = await import("./LoginPage.tsx");

            return {
                element: <LoginPage host={host} />
            };
        }
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "/logout",
        lazy: async () => {
            const { LogoutPage } = await import("./LogoutPage.tsx");

            return {
                element: <LogoutPage host={host} />
            };
        }
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "*",
        lazy: async () => {
            const { NoMatchPage } = await import("./NoMatchPage.tsx");

            return {
                element: <NoMatchPage path={location.pathname} host={host} />
            };
        }
    }, {
        parentName: "root-error-boundary"
    });
}

function registerMsw(runtime: Runtime) {
    const mswPlugin = getMswPlugin(runtime);

    mswPlugin.registerRequestHandlers([
        ...authenticationHandlers,
        ...subscriptionHandlers
    ]);
}

export function registerShell(sessionManager: SessionManager, { host }: RegisterShellOptions = {}) {
    const register: ModuleRegisterFunction<Runtime> = runtime => {
        registerRoutes(runtime, sessionManager, host);
        registerMsw(runtime);
    };

    return register;
}