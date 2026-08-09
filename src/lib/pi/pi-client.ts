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

/**
 * Marker written after a successful Pi.authenticate() that included the
 * "payments" scope. Sessions created before this marker existed (or granted
 * only "username") are treated as missing the scope, which triggers a fresh
 * consent prompt instead of the "Cannot create a payment without 'payments'
 * scope" error.
 */
const SCOPES_KEY = "sellfy.pi.scopes";

function readGrantedScopes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCOPES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function hasPaymentsScope(): boolean {
  return readGrantedScopes().includes("payments");
}

export function clearGrantedScopes(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(SCOPES_KEY);
}

/**
 * Default handler for payments left unfinished in a previous session.
 * Pi requires the app to resolve them before a new payment can start.
 */
export async function handleIncompletePayment(payment: PiPaymentDTO): Promise<void> {
  const txid = payment.transaction?.txid;
  if (!txid) {
    console.warn("[pi] Incomplete payment without txid, skipping:", payment.identifier);
    return;
  }
  try {
    await fetch("/api/public/payments/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.identifier, txid }),
    });
  } catch (error) {
    console.warn("[pi] Failed to complete incomplete payment", error);
  }
}

export async function piAuthenticate(
  onIncompletePaymentFound: (payment: PiPaymentDTO) => void = (payment) => {
    void handleIncompletePayment(payment);
  },
): Promise<PiAuthResult> {
  await initPi();
  const Pi = await getPi();
  // Always request BOTH scopes: "username" (identity) and "payments" (Pi.createPayment).
  const result = await Pi.authenticate([...PI_SCOPES], onIncompletePaymentFound);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SCOPES_KEY, JSON.stringify([...PI_SCOPES]));
  }
  return result;
}

/**
 * Guarantees the current session granted the "payments" scope before any
 * Pi.createPayment() call. Re-runs Pi Sign-In when it did not.
 */
export async function ensurePaymentsScope(): Promise<void> {
  if (hasPaymentsScope()) return;
  await piAuthenticate();
  if (!hasPaymentsScope()) {
    throw new Error(
      "The 'payments' permission was not granted. Please sign out and sign in again in the Pi Browser.",
    );
  }
}

export async function piCreatePayment(
  payment: { amount: number; memo: string; metadata: Record<string, unknown> },
  callbacks: PiPaymentCallbacks,
): Promise<void> {
  await initPi();
  await ensurePaymentsScope();
  const Pi = await getPi();
  Pi.createPayment(payment, callbacks);
}

export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Pi) || /PiBrowser/i.test(window.navigator.userAgent);
}
