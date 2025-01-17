import type { RegisterRouteOptions } from "@squide/core";
import type { IndexRouteObject, NonIndexRouteObject } from "react-router-dom";
import { ManagedRoutesOutletName, isManagedRoutesOutletRoute } from "./outlets.ts";

export type RouteVisibility = "public" | "protected";

export interface IndexRoute extends IndexRouteObject {
    $name?: string;
    $visibility?: RouteVisibility;
}

export interface NonIndexRoute extends Omit<NonIndexRouteObject, "children"> {
    $name?: string;
    $visibility?: RouteVisibility;
    children?: Route[];
}

export type Route = IndexRoute | NonIndexRoute;

export type RouteRegistrationStatus = "pending" | "registered";

function normalizePath(routePath?: string) {
    if (routePath && routePath !== "/" && routePath.endsWith("/")) {
        return routePath.substring(0, routePath.length - 1);
    }

    return routePath;
}

export function createIndexKey(route: Route) {
    if (route.path) {
        return normalizePath(route.path);
    }

    if (route.$name) {
        return route.$name;
    }

    return undefined;
}


export class RouteRegistry {
    #routes: Route[];

    // Using an index to speed up the look up of parent routes.
    // <indexKey, Route>
    readonly #routesIndex: Map<string, Route> = new Map();

    // A collection of pending routes to registered once their layout is registered.
    // <parentPath | parentName, Route[]>
    readonly #pendingRegistrations: Map<string, Route[]> = new Map();

    constructor() {
        this.#routes = [];
    }

    #addIndex(route: Route) {
        const key = createIndexKey(route);

        if (key) {
            if (this.#routesIndex.has(key)) {
                throw new Error(`[squide] A route index has already been registered for the key: "${key}". Did you register two routes with the same "path" or "name" property?`);
            }

            this.#routesIndex.set(key, route);
        }

        return key;
    }

    #recursivelyAddRoutes(routes: Route[]) {
        const newRoutes: Route[] = [];
        const completedPendingRegistrations: Route[] = [];

        routes.forEach((x: Route) => {
            // Creates a copy of the route object and add the default properties.
            const route = {
                ...x,
                $visibility: x.$visibility ?? "protected"
            };

            if (route.children) {
                // Recursively go through the children.
                const result = this.#recursivelyAddRoutes(route.children);

                route.children = result.newRoutes;

                completedPendingRegistrations.push(...result.completedPendingRegistrations);
            }

            // Add index entries to speed up the registration of future nested routes.
            const indexKey = this.#addIndex(route);

            // IMPORTANT: do not handle the pending registrations before recursively going through the children.
            // Otherwise pending routes will be handled twice (one time as a pending registration and one time as child
            // of the route).
            if (indexKey) {
                const pendingRegistrations = this.#tryRegisterPendingRoutes(indexKey);

                completedPendingRegistrations.unshift(...pendingRegistrations);
            }

            newRoutes.push(route);
        });

        return {
            newRoutes,
            completedPendingRegistrations
        };
    }

    #tryRegisterPendingRoutes(parentId: string) {
        const pendingRegistrations = this.#pendingRegistrations.get(parentId);

        if (pendingRegistrations) {
            // Try to register the pending routes.
            const { registrationStatus } = this.#addNestedRoutes(pendingRegistrations, parentId);

            if (registrationStatus === "registered") {
                // Remove the pending registrations.
                this.#pendingRegistrations.delete(parentId);

                return pendingRegistrations;
            }
        }

        return [];
    }

    #validateRouteRegistrationOptions(route: Route, { hoist, parentPath, parentName }: RegisterRouteOptions = {}) {
        if (hoist && parentPath) {
            throw new Error(`[squide] A route cannot have the "hoist" property when a "publicPath" option is provided. Route id: "${route.path ?? route.$name ?? "(no identifier)"}".`);
        }

        if (hoist && parentName) {
            throw new Error(`[squide] A route cannot have the "hoist" property when a "parentName" option is provided. Route id: "${route.path ?? route.$name ?? "(no identifier)"}".`);
        }
    }

    add(route: Route, options: RegisterRouteOptions = {}) {
        let parentName = options.parentName;

        // By default, a route that is not hoisted nor nested under a known
        // parent will be rendered under the ManagedRoutes outlet.
        if (!options.hoist && !parentName && !isManagedRoutesOutletRoute(route)) {
            parentName = ManagedRoutesOutletName;
        }

        this.#validateRouteRegistrationOptions(route, options);

        return this.#addRoute(route, {
            ...options,
            parentName
        });
    }

    #addRoute(route: Route, { parentPath, parentName }: RegisterRouteOptions) {
        if (parentPath) {
            // The normalized path cannot be undefined because it's been provided by the consumer
            // (e.g. it cannot be a pathless route).
            return this.#addNestedRoutes([route], normalizePath(parentPath)!);
        }

        if (parentName) {
            return this.#addNestedRoutes([route], parentName);
        }

        return this.#addRootRoutes([route]);
    }

    #addRootRoutes(routes: Route[]) {
        const { newRoutes, completedPendingRegistrations } = this.#recursivelyAddRoutes(routes);

        // Create a new array so the routes array is immutable.
        this.#routes = [...this.#routes, ...newRoutes];

        return {
            registrationStatus: "registered",
            completedPendingRegistrations
        };
    }

    #addNestedRoutes(routes: Route[], parentId: string) {
        const layoutRoute = this.#routesIndex.get(parentId);

        if (!layoutRoute) {
            const pendingRegistration = this.#pendingRegistrations.get(parentId);

            if (pendingRegistration) {
                pendingRegistration.push(...routes);
            } else {
                this.#pendingRegistrations.set(parentId, [...routes]);
            }

            return {
                registrationStatus: "pending",
                completedPendingRegistrations: []
            };
        }

        const { newRoutes, completedPendingRegistrations } = this.#recursivelyAddRoutes(routes);

        // Register new nested routes as children of their layout route.
        layoutRoute.children = [
            ...(layoutRoute.children ?? []),
            ...newRoutes
        ];

        // Create a new array since the routes array is immutable and a nested
        // object has been updated.
        this.#routes = [...this.#routes];

        return {
            registrationStatus: "registered",
            completedPendingRegistrations
        };
    }

    get routes() {
        return this.#routes;
    }

    get pendingRegistrations() {
        return this.#pendingRegistrations;
    }
}
