// The areModulesRegistered function is tested instead of the useAreModulesRegistered hook because it requires less mocking and
// kind of provide the same coverage as the only important logic to test for that hook is the check to validate whether
// or not the module registrations is considered as registered or not.

import { AbstractRuntime, LocalModuleRegistry } from "@squide/core";
import { RemoteModuleRegistry } from "../src/registerRemoteModules.ts";
import { areModulesRegistered } from "../src/useAreModulesRegistered.ts";

class DummyRuntime extends AbstractRuntime<unknown, unknown> {
    registerRoute() {
        throw new Error("Method not implemented.");
    }

    get routes() {
        return [];
    }

    registerNavigationItem() {
        throw new Error("Method not implemented.");
    }

    getNavigationItems() {
        return [];
    }
}

const runtime = new DummyRuntime();

test("when no modules are registered, return false", () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when only local modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only remote modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local modules and remote modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only local module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only remote module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local module deferred registrations and remote module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local module deferred registrations and remote modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local modules and remote module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});


