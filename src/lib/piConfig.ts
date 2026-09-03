// Pi Network app configuration — MAINNET ONLY.
// All values come from environment variables, never hardcoded.
// Pi Sign-In is the ONLY authentication method of this app (implicit OAuth).

/** Public oAuth Client ID (safe in the client bundle, loaded from .env). */
export const PI_CLIENT_ID =
  (import.meta.env.VITE_PI_CLIENT_ID as string | undefined) ??
  (import.meta.env.VITE_PI_CLIENT_ID_MAINNET as string | undefined) ??
  "";

/** Pi SDK version used by Pi.init(). */
export const PI_SDK_VERSION = "2.0";

/** Mainnet: real payments, sandbox always disabled. */
export const PI_SANDBOX = false;

/** Scopes requested from the Pi SDK. "payments" is required for U2A purchases. */
export const PI_SCOPES = ["username", "payments"] as const;

export const PI_REDIRECT_URI = import.meta.env.VITE_PI_REDIRECT_URI as string | undefined;

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
