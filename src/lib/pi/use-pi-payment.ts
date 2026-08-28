import { useCallback, useState } from "react";

import { approvePayment, completePayment } from "@/lib/pi/payment-api";
import { piCreatePayment } from "@/lib/pi/pi-client";


export type PiPaymentStatus =
  | { state: "idle" }
  | { state: "pending"; message: string }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export interface PiPaymentResult {
  paymentId: string;
  txid: string;
  amount: number;
}

/**
 * Generic Pi payment flow: Pi.createPayment() ->
 * /api/public/payments/approve -> /api/public/payments/complete.
 * Used by the marketplace, freelance services and course modules.
 */
export function usePiPayment() {
  const [status, setStatus] = useState<PiPaymentStatus>({ state: "idle" });

  const pay = useCallback(
    async (
      input: { amount: number; memo: string; metadata: Record<string, unknown> },
      onPaid: (result: PiPaymentResult) => void,
      successMessage?: string,
    ) => {
      const amount = Number(input.amount.toFixed(7));
      if (!Number.isFinite(amount) || amount <= 0) {
        setStatus({ state: "error", message: "Invalid amount." });
        return;
      }
      setStatus({ state: "pending", message: "Opening the Pi payment sheet…" });
      try {
        await piCreatePayment(
          { amount, memo: input.memo, metadata: input.metadata },
          {
            onReadyForServerApproval: (paymentId) => {
              setStatus({ state: "pending", message: "Approving payment…" });
              approvePayment(paymentId).catch((error: Error) =>
                setStatus({ state: "error", message: error.message }),
              );
            },
            onReadyForServerCompletion: (paymentId, txid) => {
              setStatus({ state: "pending", message: "Completing payment…" });
              completePayment(paymentId, txid)
                .then(() => {
                  onPaid({ paymentId, txid, amount });
                  setStatus({
                    state: "success",
                    message: successMessage ?? `Paid ${amount} Pi. Thank you!`,
                  });
                })
                .catch((error: Error) => setStatus({ state: "error", message: error.message }));
            },
            onCancel: () => setStatus({ state: "error", message: "Payment cancelled." }),
            onError: (error) =>
              setStatus({ state: "error", message: error.message || "Payment failed." }),
          },
        );
      } catch (error) {
        setStatus({
          state: "error",
          message: error instanceof Error ? error.message : "Payment failed.",
        });
      }
    },
    [],
  );

  return { status, setStatus, pay };
}
