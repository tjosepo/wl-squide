import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        lazy: () => import("./HomePage.tsx")
    });

    // Register federated tab.

    runtime.registerRoute({
        path: "/federated-tabs/officevibe",
        lazy: () => import("./OfficevibeTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Officevibe",
        to: "/federated-tabs/officevibe"
    }, {
        menuId: "/federated-tabs"
    });
};