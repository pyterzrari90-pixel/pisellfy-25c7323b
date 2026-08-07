import { useCallback, useState } from "react";
import { purchaseDigitalProduct, type DigitalProduct } from "@/lib/piPayments";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";

export const usePiPayment = () => {
  const { session, signIn } = usePiAuth();
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const buy = useCallback(
    async (product: DigitalProduct) => {
      if (!session) {
        await signIn();
      }
      setPendingProductId(String(product.id));
      try {
        await purchaseDigitalProduct(product, {
          onSuccess: () => {
            setPendingProductId(null);
            toast({
              title: "Payment complete",
              description: `You now own "${product.title}".`,
            });
          },
          onCancel: () => {
            setPendingProductId(null);
            toast({ title: "Payment cancelled", variant: "destructive" });
          },
          onError: (message) => {
            setPendingProductId(null);
            toast({ title: "Payment failed", description: message, variant: "destructive" });
          },
        });
      } catch (e) {
        setPendingProductId(null);
        const message = e instanceof Error ? e.message : "Payment could not be started";
        toast({ title: "Payment failed", description: message, variant: "destructive" });
      }
    },
    [session, signIn],
  );

  return { buy, pendingProductId };
};
