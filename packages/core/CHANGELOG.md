# @squide/core

## 2.1.0

### Minor Changes

- [#101](https://github.com/gsoft-inc/wl-squide/pull/101) [`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This release introduces new APIs to support deferred routes registration with the ultimate goal of conditionally adding routes based on feature flags.

  - Updated the `ModuleRegisterFunction` type to accept a `function` as the return value.
  - Added a `completeLocalModuleRegistrations` function to complete the second phase of the registration process for local modules.

## 2.0.0

### Major Changes

- [#93](https://github.com/gsoft-inc/wl-squide/pull/93) [`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180) Thanks [@patricklafrance](https://github.com/patricklafrance)! - ### Addition

  - Added support for plugins to Squide runtime.
  - Added a `parentName` option to `registerRoute`.

  ### Updated

  - The `layoutPath` option of `registerRoute` has been renamed to `parentPath`.
  - `registerNavigationItems` has been renamed to `registerNavigationItem` and now only accepts a single item by call.
  - A navigation item `label`, `additionalProps` and `priority` fields has been renamed to `$label`, `$additionalProps` and `$priority`. This is part of an effort to ensure no future release of [React Router](https://reactrouter.com/en/main) introduced new properties with names that are conflicting with Squide.
  - Local modules `register` function can now be `async`. This is useful if you want for example to conditionally to a dynamic `import` to load a dependency such as [msw](https://www.npmjs.com/package/msw).

  ### Removed

  - Removed the Service features at it was confusing and not that helpful. We recommend using React context instead to share services with the modules.

## 1.1.1

### Patch Changes

- [#77](https://github.com/gsoft-inc/wl-squide/pull/77) [`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975) Thanks [@patricklafrance](https://github.com/patricklafrance)! - TBD

## 1.1.0

### Minor Changes

- [#73](https://github.com/gsoft-inc/wl-squide/pull/73) [`5407086`](https://github.com/gsoft-inc/wl-squide/commit/5407086a98587901abe341360729f8fe972d8174) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Added a new composable nested layouts feature

## 1.0.2

### Patch Changes

- [#66](https://github.com/gsoft-inc/wl-squide/pull/66) [`1a419de`](https://github.com/gsoft-inc/wl-squide/commit/1a419de33e22af7af990984068ab864e5be8fd4b) Thanks [@patricklafrance](https://github.com/patricklafrance)! - New release

## 1.0.1

### Patch Changes

- [#54](https://github.com/gsoft-inc/wl-squide/pull/54) [`1f0e967`](https://github.com/gsoft-inc/wl-squide/commit/1f0e96781513b262122fb8e47e10379caae0b731) Thanks [@ofrogon](https://github.com/ofrogon)! - Migrate project from GitHub organization

## 1.0.0

### Major Changes

- [#30](https://github.com/gsoft-inc/wl-squide/pull/30) [`edcd948`](https://github.com/gsoft-inc/wl-squide/commit/edcd948fa942a36fa77b05459722e91fa2f80f11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - First stable release of @squide

## 0.0.1

### Patch Changes

- [#20](https://github.com/gsoft-inc/wl-squide/pull/20) [`1c3e332`](https://github.com/gsoft-inc/wl-squide/commit/1c3e3321ba2f54558f8b10b934d0defa8156ae29) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Testing changeset configuration
