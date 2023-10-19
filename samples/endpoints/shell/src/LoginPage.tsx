import { useIsAuthenticated } from "@squide/react-router";
import axios from "axios";
import { useCallback, useState, type ChangeEvent, type MouseEvent } from "react";
import { Navigate } from "react-router-dom";

export interface LoginPageProps {
    host?: string;
}

export function LoginPage({ host }: LoginPageProps) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isBusy, setIsBusy] = useState(false);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        setIsBusy(true);
        setErrorMessage(undefined);

        axios.post("/api/login", { username, password })
            .then(() => {
                setIsBusy(false);

                // Reloading the whole application so the "App.tsx" component is re-rendered. Ideally, "useNavigate" would be
                // used so "App.tsx" component would re-renderer everytime the location change but it doesn't
                // seem feasible (at least  not easily) as public and private routes go through the "App.tsx" component.
                // Anyhow, since all the Workleap apps will authenticate through a third party authentication provider, it
                // doesn't seems like a big deal as the application will be reloaded anyway after the user logged in on the third party.
                // application will be reloaded anyway after the login on the third party.
                window.location.href = "/";
            })
            .catch((error: unknown) => {
                setIsBusy(false);

                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    setErrorMessage("Invalid credentials, please try again.");
                } else {
                    throw error;
                }
            });
    }, [username, password]);

    const handleUserNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    }, []);

    const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }, []);

    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <>
            <h1>Login</h1>
            {host && <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>{host}</code></p>}
            <form>
                <div>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" onChange={handleUserNameChange} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" onChange={handlePasswordChange} />
                </div>
                <div>
                    <button type="submit" onClick={handleClick}>
                        Login
                    </button>
                </div>
                <br />
                <div>Hint: use temp/temp :)</div>
                <br />
                {isBusy && <div style={{ color: "blue" }}>Loading...</div>}
                {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
            </form>
        </>
    );
}

export const Component = LoginPage;