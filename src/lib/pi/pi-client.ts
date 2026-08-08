import { PI_CLIENT_ID, PI_ENVIRONMENT, PI_SANDBOX, PI_SCOPES, PI_SDK_VERSION } from "./pi-config";
import type { PiAuthResult, PiPaymentCallbacks, PiPaymentDTO, PiSDK } from "./pi-types";

/** Wait for the Pi SDK script (loaded in __root.tsx) to be available. */
async function getPi(timeoutMs = 8000): Promise<PiSDK> {
  const start = Date.now();
  while (typeof window !== "undefined" && !window.Pi) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Pi SDK not available. Please open sellfy in the Pi Browser.");
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!window.Pi) throw new Error("Pi SDK not available.");
  return window.Pi;
}

let initialized = false;

export async function initPi(): Promise<void> {
  if (initialized) return;
  const Pi = await getPi();
  if (PI_ENVIRONMENT === "mainnet" && !PI_CLIENT_ID) {
    console.warn(
      "[pi] VITE_PI_CLIENT_ID_MAINNET is empty — set it before going live on Pi Mainnet.",
    );
  }
  // Mainnet => sandbox: false (real payments). Testnet => sandbox: true.
  Pi.init({ version: PI_SDK_VERSION, sandbox: PI_SANDBOX });
  initialized = true;
}


export async function piAuthenticate(
  onIncompletePaymentFound: (payment: PiPaymentDTO) => void = () => {},
): Promise<PiAuthResult> {
  await initPi();
  const Pi = await getPi();
  return Pi.authenticate(PI_SCOPES, onIncompletePaymentFound);
}

export async function piCreatePayment(
  payment: { amount: number; memo: string; metadata: Record<string, unknown> },
  callbacks: PiPaymentCallbacks,
): Promise<void> {
  await initPi();
  const Pi = await getPi();
  Pi.createPayment(payment, callbacks);
}

export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Pi) || /PiBrowser/i.test(window.navigator.userAgent);
}
