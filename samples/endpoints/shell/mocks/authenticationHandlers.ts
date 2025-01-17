import { rest, type RestHandler } from "msw";
import { sessionManager } from "./session.ts";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

export const authenticationHandlers: RestHandler[] = [
    rest.post("/api/login", async (req, res, ctx) => {
        const { username, password } = await req.json();

        if (username !== "temp" || password !== "temp") {
            return res(
                ctx.status(401)
            );
        }

        await simulateDelay(1000);

        sessionManager.setSession({
            userId: Math.random(),
            username
        });

        return res(
            ctx.status(200)
        );
    }),

    rest.post("/api/logout", async (req, res, ctx) => {
        sessionManager.clearSession();

        return res(
            ctx.status(200)
        );
    }),

    rest.get("/api/session", async (req, res, ctx) => {
        const session = sessionManager.getSession();

        if (!session) {
            return res(
                ctx.status(401)
            );
        }

        await simulateDelay(500);

        return res(
            ctx.status(200),
            ctx.json(session)
        );
    })
];
