// @ts-check

import { defineBuildHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

// The trailing / is very important, otherwise paths will not be resolved correctly.
const publicPath = process.env.NETLIFY === "true" ? "https://squide-endpoints-host.netlify.app/" : "http://localhost:8080/";

export default defineBuildHostConfig(swcConfig, "host", publicPath, {
    features: {
        msw: true
    },
    sharedDependencies: {
        "@endpoints/shared": {
            singleton: true,
            eager: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

