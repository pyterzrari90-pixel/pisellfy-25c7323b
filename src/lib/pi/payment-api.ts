/**
 * Client helpers for the Pi server flow:
 * /api/public/payments/approve and /api/public/payments/complete.
 * Errors include the Pi Platform status/body so failures can be diagnosed
 * (bad API key, wrong network, expired payment, …).
 */

interface ApiError {
  error?: string;
  piStatus?: number;
  piBody?: string;
}

async function post(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => null)) as ApiError | null;
  if (!res.ok) {
    const detail = payload?.piStatus
      ? ` (Pi API ${payload.piStatus}: ${payload.piBody ?? ""})`
      : "";
    const message = `${payload?.error ?? `Request failed (${res.status})`}${detail}`;
    console.error("[pi] server call failed", path, message);
    throw new Error(message);
  }
  return payload;
}

/** Retries once: a transient network hiccup must not expire the payment. */
async function postWithRetry(path: string, body: unknown): Promise<unknown> {
  try {
    return await post(path, body);
  } catch (error) {
    console.warn("[pi] retrying", path, error);
    return post(path, body);
  }
}

export function approvePayment(paymentId: string) {
  return postWithRetry("/api/public/payments/approve", { paymentId });
}

export function completePayment(paymentId: string, txid: string) {
  return postWithRetry("/api/public/payments/complete", { paymentId, txid });
}
