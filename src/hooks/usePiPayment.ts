import { useCallback, useState } from "react";
import { purchaseDigitalProduct, type DigitalProduct } from "@/lib/piPayments";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";

/** Human-readable message for every Pi payment failure case. */
export const piErrorMessage = (raw: string): string => {
  if (/cancel|denied|abort|closed/i.test(raw)) return "Payment cancelled in the Pi wallet.";
  if (/timeout|timed out/i.test(raw)) return "The Pi payment timed out. Please try again.";
  if (/network|fetch|unreachable|offline/i.test(raw))
    return "Network problem while talking to Pi Network. Check your connection and retry.";
  if (/Pi SDK|Pi Browser/i.test(raw)) return "Open Sellfy.pi in the Pi Browser to pay with Pi.";
  return raw || "The Pi payment failed.";
};

export const usePiPayment = () => {
  const { session, signIn } = usePiAuth();
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  /** Promise-based purchase: resolves on completion, rejects on error/cancel. */
  const buyAsync = useCallback(
    async (product: DigitalProduct) => {
      if (!session) await signIn();
      setPendingProductId(String(product.id));
      try {
        await new Promise<void>((resolve, reject) => {
          void purchaseDigitalProduct(product, {
            onSuccess: () => resolve(),
            onCancel: () => reject(new Error("Payment cancelled")),
            onError: (message) => reject(new Error(message)),
          }).catch(reject);
        });
      } finally {
        setPendingProductId(null);
      }
    },
    [session, signIn],
  );

  const buy = useCallback(
    async (product: DigitalProduct) => {
      try {
        await buyAsync(product);
        toast({
          title: "Payment complete",
          description: `You now own "${product.title}".`,
        });
      } catch (e) {
        const raw = e instanceof Error ? e.message : "Payment could not be started";
        const message = piErrorMessage(raw);
        toast({
          title: /cancel/i.test(raw) ? "Payment cancelled" : "Payment failed",
          description: message,
          variant: "destructive",
        });
      }
    },
    [buyAsync],
  );

  return { buy, buyAsync, pendingProductId };
};
