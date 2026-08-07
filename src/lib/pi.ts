// Pi Network SDK loader + init helper.
// Docs: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Authentication

export interface PiAuthResult {
  accessToken: string;
  user: { uid: string; username: string };
}

export interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void,
  ) => Promise<PiAuthResult>;
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

/** Loads the SDK and awaits Pi.init() fully (it is treated as a Promise). */
export function initPi(): Promise<PiSDK> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const Pi = await loadPiSdk();
    const sandbox =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname.endsWith(".lovable.app"));
    // Pi.init may return a Promise - await it fully before authenticating.
    await Promise.resolve(Pi.init({ version: "2.0", sandbox }));
    return Pi;
  })();

  return initPromise;
}

export async function authenticateWithPi(): Promise<PiAuthResult> {
  const Pi = await initPi();
  return await Pi.authenticate(["username"], (payment) => {
    console.warn("Incomplete Pi payment found", payment);
  });
}
