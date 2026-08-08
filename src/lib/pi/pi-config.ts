/**
 * Pi Network configuration.
 * Keep Pi platform config separate from business logic.
 *
 * Environment switch:
 *   VITE_PI_ENVIRONMENT = "mainnet" | "testnet"   (default: "mainnet")
 *   VITE_PI_CLIENT_ID_MAINNET = <oAuth Client ID for Pi Mainnet>
 *   VITE_PI_CLIENT_ID_TESTNET = <oAuth Client ID for Pi Testnet/sandbox>
 */

export const PI_APP_NAME = "sellfy";
export const PI_APP_VERSION = "1.0.0";
export const PI_SDK_VERSION = "2.0";
export const PI_DEVELOPER = "SWILLER90";

export type PiEnvironment = "mainnet" | "testnet";

/** Active Pi environment. Switch without touching any other code. */
export const PI_ENVIRONMENT: PiEnvironment =
  (import.meta.env['VITE_PI_ENVIRONMENT'] as PiEnvironment | undefined) === "testnet"
    ? "testnet"
    : "mainnet";

/** Testnet oAuth Client ID (kept separate so testing can continue in parallel). */
export const PI_CLIENT_ID_TESTNET =
  (import.meta.env['VITE_PI_CLIENT_ID_TESTNET'] as string | undefined) ??
  "ukd2R92lcfbXYFAlM89ULSpi5v6Bta8rF_QCL1mmF5o";

/** Mainnet oAuth Client ID (public value, safe in the client bundle). */
export const PI_CLIENT_ID_MAINNET =
  (import.meta.env['VITE_PI_CLIENT_ID_MAINNET'] as string | undefined) ?? "";

/** Client ID actually used by the app, based on PI_ENVIRONMENT. */
export const PI_CLIENT_ID =
  PI_ENVIRONMENT === "mainnet" ? PI_CLIENT_ID_MAINNET : PI_CLIENT_ID_TESTNET;

/** Scopes requested during Pi Sign-In. */
export const PI_SCOPES = ["username", "payments"] as const;

/** Sandbox is only ever enabled on testnet; Mainnet always runs with sandbox: false. */
export const PI_SANDBOX = PI_ENVIRONMENT === "testnet";
