// Pi Network app configuration — values come from environment variables,
// never hardcoded. Implicit OAuth only (Pi Network does not support client_secret yet).

export const PI_OAUTH_CLIENT_ID = import.meta.env.VITE_PI_OAUTH_CLIENT_ID as string | undefined;
export const PI_REDIRECT_URI = import.meta.env.VITE_PI_REDIRECT_URI as string | undefined;

/** Scopes requested from the Pi SDK. "payments" is required for U2A purchases. */
export const PI_SCOPES = ["username", "payments"] as const;

/** True when the browser is already on the configured redirect origin. */
export function isOnRedirectOrigin(): boolean {
  if (typeof window === "undefined" || !PI_REDIRECT_URI) return true;
  try {
    return new URL(PI_REDIRECT_URI).origin === window.location.origin;
  } catch {
    return true;
  }
}

/** Sends the pioneer to the configured redirect URI after a successful sign-in. */
export function redirectAfterAuth(): void {
  if (!PI_REDIRECT_URI || isOnRedirectOrigin()) return;
  window.location.assign(PI_REDIRECT_URI);
}
