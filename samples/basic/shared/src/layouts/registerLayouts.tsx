import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export interface RegisterLayoutsOptions {
    host?: string;
}

export function registerLayouts({ host }: RegisterLayoutsOptions = {}) {
    const register: ModuleRegisterFunction<Runtime> = runtime => {
        runtime.registerRoute({
            path: "/federated-tabs",
            lazy: async () => {
                const { FederatedTabsLayout } = await import("./FederatedTabsLayout.tsx");

                return {
                    element: <FederatedTabsLayout host={host} />
                };
            }
        });

        runtime.registerNavigationItem({
            $label: "Tabs",
            to: "/federated-tabs"
        });
    };

    return register;
}