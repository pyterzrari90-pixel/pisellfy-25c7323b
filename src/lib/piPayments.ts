import { supabase } from "@/integrations/supabase/client";
import { initPi, type PiPaymentDTO } from "@/lib/pi";

export interface DigitalProduct {
  id: string | number;
  title: string;
  /** Price in Pi */
  amount: number;
}

async function callBackend(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("pi-payment", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data;
}

export const buildMemo = (product: DigitalProduct) =>
  `Purchase: ${product.title}`.slice(0, 60);

export const buildMetadata = (product: DigitalProduct) => ({
  type: "digital_product_purchase" as const,
  product_id: String(product.id),
  product_title: product.title,
  amount: product.amount,
});

/** Completes a payment reported by onIncompletePaymentFound. */
export async function completeIncompletePayment(payment: PiPaymentDTO) {
  const txid = payment?.transaction?.txid;
  if (!txid) {
    await callBackend({ action: "cancel", paymentId: payment.identifier });
    return;
  }
  await callBackend({ action: "complete", paymentId: payment.identifier, txid });
}

export interface PurchaseHandlers {
  onSuccess?: (paymentId: string, txid: string) => void;
  onCancel?: (paymentId: string) => void;
  onError?: (message: string) => void;
}

/** U2A purchase of a digital product. Awaits Pi.init() before createPayment. */
export async function purchaseDigitalProduct(
  product: DigitalProduct,
  handlers: PurchaseHandlers = {},
) {
  const Pi = await initPi();

  const paymentData = {
    amount: product.amount,
    memo: buildMemo(product),
    metadata: buildMetadata(product),
  };

  Pi.createPayment(paymentData, {
    onReadyForServerApproval: (paymentId) => {
      void callBackend({
        action: "approve",
        paymentId,
        product: {
          id: String(product.id),
          title: product.title,
          amount: product.amount,
        },
      }).catch((e) => handlers.onError?.(e instanceof Error ? e.message : "Approval failed"));
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      void callBackend({ action: "complete", paymentId, txid })
        .then(() => handlers.onSuccess?.(paymentId, txid))
        .catch((e) => handlers.onError?.(e instanceof Error ? e.message : "Completion failed"));
    },
    onCancel: (paymentId) => {
      void callBackend({ action: "cancel", paymentId }).catch(() => undefined);
      handlers.onCancel?.(paymentId);
    },
    onError: (error, payment) => {
      if (payment?.identifier) {
        void callBackend({ action: "cancel", paymentId: payment.identifier }).catch(() => undefined);
      }
      handlers.onError?.(error?.message ?? "Payment failed");
    },
  });
}
