// Pi Network SDK loader + init helper.
// Docs: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Authentication
//       https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Payments
import { PI_CLIENT_ID, PI_SANDBOX, PI_SCOPES, PI_SDK_VERSION } from "@/lib/piConfig";

export interface PiAuthResult {
  accessToken: string;
  user: { uid: string; username: string };
}

export interface PiPaymentDTO {
  identifier: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  transaction?: { txid: string; verified: boolean } | null;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

export interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void,
  ) => Promise<PiAuthResult>;
  createPayment: (data: PiPaymentData, callbacks: PiPaymentCallbacks) => void;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

const SDK_URL = "https://sdk.minepi.com/pi-sdk.js";

let loadPromise: Promise<PiSDK> | null = null;

export function loadPiSdk(): Promise<PiSDK> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<PiSDK>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Pi SDK requires a browser environment"));
      return;
    }
    if (window.Pi) {
      resolve(window.Pi);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const script = existing ?? document.createElement("script");

    const onLoad = () => {
      if (window.Pi) resolve(window.Pi);
      else reject(new Error("Pi SDK loaded but window.Pi is unavailable"));
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", () =>
      reject(new Error("Failed to load the Pi SDK. Open this app in the Pi Browser.")),
    );

    if (!existing) {
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return loadPromise;
}

let initPromise: Promise<PiSDK> | null = null;

/**
 * Loads the SDK and awaits Pi.init() fully (it is treated as a Promise).
 * Called once at app startup, before any other Pi SDK call.
 */
export function initPi(): Promise<PiSDK> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const Pi = await loadPiSdk();
    if (!PI_CLIENT_ID) {
      console.warn("[pi] VITE_PI_CLIENT_ID is missing — add it to your environment variables.");
    }
    // Mainnet: real payments, sandbox disabled.
    // Pi.init may return a Promise - await it fully before authenticating or paying.
    await Promise.resolve(Pi.init({ version: PI_SDK_VERSION, sandbox: PI_SANDBOX }));
    return Pi;
  })().catch((error: unknown) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

/** Completes a payment that was left in-flight from a previous session. */
export async function handleIncompletePayment(payment: PiPaymentDTO) {
  const { completeIncompletePayment } = await import("@/lib/piPayments");
  await completeIncompletePayment(payment);
}

export async function authenticateWithPi(): Promise<PiAuthResult> {
  const Pi = await initPi();
  // "username" is the minimum; "payments" is required for U2A payments via Pi.createPayment.
  return await Pi.authenticate([...PI_SCOPES], (payment) => {
    void handleIncompletePayment(payment);
  });
}
