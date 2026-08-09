import { useCallback, useState } from "react";

import { approvePayment, completePayment } from "@/lib/pi/payment-api";
import { piCreatePayment } from "@/lib/pi/pi-client";
import { useStore, type Order } from "./store";


export type PaymentStatus =
  | { state: "idle" }
  | { state: "pending"; message: string }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function usePiCheckout() {
  const { user, products, cart, cartTotal, clearCart, addOrder } = useStore();
  const [status, setStatus] = useState<PaymentStatus>({ state: "idle" });

  const payWithPi = useCallback(
    async (lines: { productId: string; quantity: number }[], memo: string) => {
      if (!user) {
        setStatus({ state: "error", message: "Please sign in with Pi first." });
        return;
      }
      const items = lines.flatMap((l) => {
        const product = products.find((p) => p.id === l.productId);
        return product
          ? [{ productId: product.id, name: product.name, price: product.price, quantity: l.quantity }]
          : [];
      });
      const amount = Number(
        items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(7),
      );
      if (amount <= 0) {
        setStatus({ state: "error", message: "Nothing to pay for." });
        return;
      }

      setStatus({ state: "pending", message: "Opening the Pi payment sheet…" });

      try {
        await piCreatePayment(
          { amount, memo, metadata: { uid: user.uid, items } },
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
                  const order: Order = {
                    id: `o-${Date.now().toString(36)}`,
                    paymentId,
                    txid,
                    createdAt: new Date().toISOString(),
                    total: amount,
                    items,
                  };
                  addOrder(order);
                  clearCart();
                  setStatus({ state: "success", message: `Paid ${amount} Pi. Thank you!` });
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
    [user, products, addOrder, clearCart],
  );

  return { status, setStatus, payWithPi, cart, cartTotal };
}
