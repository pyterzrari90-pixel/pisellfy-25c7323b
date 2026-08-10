import { createFileRoute } from "@tanstack/react-router";

/**
 * Validates a Pi access token server-side before a session is established.
 * No Pi API key is required for this flow — the user's own access token is
 * forwarded to Pi's /v2/me endpoint.
 */
export const Route = createFileRoute("/api/public/auth/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let accessToken: unknown;
        try {
          const body = (await request.json()) as { accessToken?: unknown };
          accessToken = body.accessToken;
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        if (typeof accessToken !== "string" || accessToken.length < 10) {
          return Response.json({ error: "Missing access token." }, { status: 400 });
        }

        let piResponse: Response;
        try {
          piResponse = await fetch("https://api.minepi.com/v2/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(10_000),
          });
        } catch (error) {
          console.error("[pi-auth] /v2/me request failed", error);
          return Response.json(
            { error: "Could not reach the Pi authentication server." },
            { status: 502 },
          );
        }

        const text = await piResponse.text();
        if (!piResponse.ok) {
          console.warn("[pi-auth] /v2/me rejected token", piResponse.status, text);
          return Response.json(
            { error: "Invalid Pi access token.", piStatus: piResponse.status },
            { status: 401 },
          );
        }

        let me: { uid?: string; username?: string };
        try {
          me = JSON.parse(text) as { uid?: string; username?: string };
        } catch {
          return Response.json({ error: "Unexpected Pi response." }, { status: 502 });
        }

        if (!me.uid) {
          return Response.json({ error: "Pi did not return a user." }, { status: 401 });
        }

        return Response.json({ uid: me.uid, username: me.username ?? "" });
      },
    },
  },
});
