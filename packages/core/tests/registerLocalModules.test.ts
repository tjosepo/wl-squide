import { LocalModuleRegistry } from "../src/federation/registerLocalModules.ts";
import { AbstractRuntime } from "../src/runtime/abstractRuntime.ts";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

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

test("can register all the modules", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        register1,
        register2,
        register3
    ], runtime);

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a module is asynchronous, the function can be awaited", async () => {
    const registry = new LocalModuleRegistry();

    let hasBeenCompleted = false;

    await registry.registerModules([
        () => {},
        async () => {
            await simulateDelay(10);

            hasBeenCompleted = true;
        },
        () => {}
    ], runtime);

    expect(hasBeenCompleted).toBeTruthy();
});

test("when called twice, throw an error", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([() => {}], runtime);

    await expect(async () => registry.registerModules([() => {}], runtime)).rejects.toThrow(/The registerLocalModules function can only be called once/);
});

test("when there are no deferred registrations, once all the modules are registered, set the status to \"ready\"", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when there are deferred registrations, once all the modules are registered, set the status to \"registered\"", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("registered");
});

test("when a module registration fail, register the remaining modules", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        register1,
        () => { throw new Error("Module 2 registration failed"); },
        register3
    ], runtime);

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a module registration fail, return the error", async () => {
    const registry = new LocalModuleRegistry();

    const errors = await registry.registerModules([
        () => {},
        () => { throw new Error("Module 2 registration failed"); },
        () => {}
    ], runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});


