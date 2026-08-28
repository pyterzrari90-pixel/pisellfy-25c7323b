/**
 * Pi Network configuration — MAINNET ONLY (real payments).
 * Keep Pi platform config separate from business logic.
 *
 * There is no testnet/sandbox path anymore: the app always runs on Pi Mainnet
 * with sandbox disabled.
 */

export const PI_APP_NAME = "sellfy";
export const PI_APP_VERSION = "1.0.0";
export const PI_SDK_VERSION = "2.0";
export const PI_DEVELOPER = "SWILLER90";

export type PiEnvironment = "mainnet";

/** Active Pi environment. Always mainnet. */
export const PI_ENVIRONMENT: PiEnvironment = "mainnet";

/** Mainnet oAuth Client ID (public value, safe in the client bundle). */
export const PI_CLIENT_ID_MAINNET =
  (import.meta.env['VITE_PI_CLIENT_ID_MAINNET'] as string | undefined) ??
  "ScGmmvjKDYywIvAtSqX-XJcGskGotJm2tt22HP_S8Ss";

/** Client ID actually used by the app. */
export const PI_CLIENT_ID = PI_CLIENT_ID_MAINNET;

/** Scopes requested during Pi Sign-In. */
export const PI_SCOPES = ["username", "payments"] as const;

/** Mainnet always runs with sandbox: false. */
export const PI_SANDBOX = false;
