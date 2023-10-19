# @squide/msw

## 2.0.0

### Major Changes

- [#93](https://github.com/gsoft-inc/wl-squide/pull/93) [`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This is a new package to help with [Mock Service Worker](https://mswjs.io/) in a federated application.

  It helps to register their request handlers:

  **In module:**

  ```ts
  const mswPlugin = getMswPlugin(runtime);
  mswPlugin.registerRequestHandlers(requestHandlers);
  ```

  **In the host app:**

  ```ts
  import("../mocks/browser.ts").then(({ startMsw }) => {
    startMsw(mswPlugin.requestHandlers);

    setMswAsStarted();
  });
  ```

  And offer an utility to wait for MSW to be started before rendering the app:

  ```ts
  const isMswStarted = useIsMswStarted(process.env.USE_MSW);
  ```

### Patch Changes

- Updated dependencies [[`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180)]:
  - @squide/core@2.0.0