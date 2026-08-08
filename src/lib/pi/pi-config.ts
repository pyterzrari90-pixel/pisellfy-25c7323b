/**
 * Pi Network configuration.
 * Keep Pi platform config separate from business logic.
 */

export const PI_APP_NAME = "sellfy";
export const PI_APP_VERSION = "1.0.0";
export const PI_SDK_VERSION = "2.0";
export const PI_DEVELOPER = "SWILLER90";

/** OAuth client ID (public value, safe in the client bundle). */
export const PI_CLIENT_ID =
  (import.meta.env['VITE_PI_CLIENT_ID'] as string | undefined) ??
  "ukd2R92lcfbXYFAlM89ULSpi5v6Bta8rF_QCL1mmF5o";

/** Scopes requested during Pi Sign-In. */
export const PI_SCOPES = ["username", "payments"] as const;

/** Sandbox is enabled outside of the Pi Browser production environment. */
export const PI_SANDBOX = false;
