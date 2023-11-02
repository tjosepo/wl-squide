---
"@squide/firefly": major
---

This is a new package that offer a base `AppRouter` component for the "firefly" stack: React Router + MSW + Webpack

Basic usage of the new base `AppRouter` component:

```tsx
import { AppRouter as FireflyAppRouter } from "@squide/firefly";

function Loading() {
    return (
        <div>Loading...</div>
    );
}

function BootstrappingErrorBoundary() {
    return (
        <div>An error occured while bootstrapping the application.</div>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter
            fallbackElement={<Loading />}
            errorElement={<BootstrappingErrorBoundary />}
            waitForMsw={false}
        />
    );
}
```

Advanced usage with public data, protected data, MSW and deferred registrations:

```tsx
export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
    // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
    // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();
    const [subscription, setSubscription] = useState<Subscription>();

    const logger = useLogger();
    const runtime = useRuntime();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, logger, signal);
    }, [logger]);

    const handleLoadProtectedData = useCallback((signal: AbortSignal) => {
        const setSession = (session: Session) => {
            sessionManager.setSession(session);
        };

        return fetchProtectedData(setSession, setSubscription, logger, signal);
    }, [logger, sessionManager]);

    const handleCompleteRegistration = useCallback(() => {
        return completeModuleRegistrations(runtime, {
            featureFlags
        });
    }, [runtime, featureFlags]);

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <SubscriptionContext.Provider value={subscription}>
                <TelemetryServiceContext.Provider value={telemetryService}>
                    <FireflyAppRouter
                        fallbackElement={<Loading />}
                        errorElement={<BootstrappingErrorBoundary />}
                        waitForMsw={waitForMsw}
                        onLoadPublicData={handleLoadPublicData}
                        onLoadProtectedData={handleLoadProtectedData}
                        onCompleteRegistration={handleCompleteRegistration}
                    />
                </TelemetryServiceContext.Provider>
            </SubscriptionContext.Provider>
        </FeatureFlagsContext.Provider>
    );
}
```