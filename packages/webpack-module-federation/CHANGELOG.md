# @squide/webpack-module-federation

## 2.1.0

### Minor Changes

- [#101](https://github.com/gsoft-inc/wl-squide/pull/101) [`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This release introduces new APIs to support deferred routes registration with the ultimate goal of conditionally adding routes based on feature flags.

  - Added a `completeRemoteModuleRegistrations` function to complete the second phase of the registration process for local remote modules.
  - Added a `completeModuleRegistrations` function to execute `completeLocalModuleRegistrations` and `completeRemoteModuleRegistrations` in a single call.
  - Added the `useAreModulesRegistered` hook to re-render the application once all the modules are registered (but not ready).
  - Reworked the `useAreModulesReady` hook to be complimentary to the `useAreModulesRegistered` hook when deferred registrations are registered. The hook is backward compatible and includes no breaking changes.
  - Added a `features` section to the defineConfig functions options.

### Patch Changes

- Updated dependencies [[`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009)]:
  - @squide/core@2.1.0

## 2.0.0

### Major Changes

- [#93](https://github.com/gsoft-inc/wl-squide/pull/93) [`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - The devserver error overlay is now disabled by default for the remote modules to prevent them from stacking on top of the host application error overlay.
  - Remote modules `register` functions can now be `async`.

### Patch Changes

- Updated dependencies [[`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180)]:
  - @squide/core@2.0.0

## 1.0.5

### Patch Changes

- [#83](https://github.com/gsoft-inc/wl-squide/pull/83) [`b29c492`](https://github.com/gsoft-inc/wl-squide/commit/b29c492ab34af978c2c5d34a67234bb9a6949651) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - `eager` was defined for the common shared dependencies of the host application and the modules. This was causing every dependencies to be loaded twice, fixed it.
  - `useAreRemotesReady` was never being ready if there was no local modules configured, fixed it.

## 1.0.4

### Patch Changes

- [#77](https://github.com/gsoft-inc/wl-squide/pull/77) [`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975) Thanks [@patricklafrance](https://github.com/patricklafrance)! - TBD

- Updated dependencies [[`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975)]:
  - @squide/core@1.1.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`5407086`](https://github.com/gsoft-inc/wl-squide/commit/5407086a98587901abe341360729f8fe972d8174)]:
  - @squide/core@1.1.0

## 1.0.2

### Patch Changes

- [#66](https://github.com/gsoft-inc/wl-squide/pull/66) [`1a419de`](https://github.com/gsoft-inc/wl-squide/commit/1a419de33e22af7af990984068ab864e5be8fd4b) Thanks [@patricklafrance](https://github.com/patricklafrance)! - New release

- Updated dependencies [[`1a419de`](https://github.com/gsoft-inc/wl-squide/commit/1a419de33e22af7af990984068ab864e5be8fd4b)]:
  - @squide/core@1.0.2

## 1.0.1

### Patch Changes

- [#54](https://github.com/gsoft-inc/wl-squide/pull/54) [`1f0e967`](https://github.com/gsoft-inc/wl-squide/commit/1f0e96781513b262122fb8e47e10379caae0b731) Thanks [@ofrogon](https://github.com/ofrogon)! - Migrate project from GitHub organization

- Updated dependencies [[`1f0e967`](https://github.com/gsoft-inc/wl-squide/commit/1f0e96781513b262122fb8e47e10379caae0b731)]:
  - @squide/core@1.0.1

## 1.0.0

### Major Changes

- [#30](https://github.com/gsoft-inc/wl-squide/pull/30) [`edcd948`](https://github.com/gsoft-inc/wl-squide/commit/edcd948fa942a36fa77b05459722e91fa2f80f11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - First stable release of @squide

### Patch Changes

- Updated dependencies [[`edcd948`](https://github.com/gsoft-inc/wl-squide/commit/edcd948fa942a36fa77b05459722e91fa2f80f11)]:
  - @squide/core@1.0.0

## 0.0.1

### Patch Changes

- [#20](https://github.com/gsoft-inc/wl-squide/pull/20) [`1c3e332`](https://github.com/gsoft-inc/wl-squide/commit/1c3e3321ba2f54558f8b10b934d0defa8156ae29) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Testing changeset configuration

- Updated dependencies [[`1c3e332`](https://github.com/gsoft-inc/wl-squide/commit/1c3e3321ba2f54558f8b10b934d0defa8156ae29)]:
  - @squide/core@0.0.1
