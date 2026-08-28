/** Minimal typings for the Pi SDK (window.Pi) loaded from sdk.minepi.com. */

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

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

export interface PiSDK {
  /** May return a Promise — always await it before calling authenticate(). */
  init: (config: { version: string; sandbox?: boolean }) => void | Promise<void>;
  authenticate: (
    scopes: readonly string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void,
  ) => Promise<PiAuthResult>;
  createPayment: (
    payment: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: PiPaymentCallbacks,
  ) => void;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

export {};
