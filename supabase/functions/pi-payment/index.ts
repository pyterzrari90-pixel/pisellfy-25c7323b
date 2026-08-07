import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const PI_API = "https://api.minepi.com/v2";

function piHeaders(apiKey: string) {
  return { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("PI_NETWORK_API_KEY");
  if (!apiKey) return json({ error: "PI_NETWORK_API_KEY is not configured" }, 500);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const paymentId = body?.paymentId;

    if (typeof paymentId !== "string" || !paymentId) {
      return json({ error: "Missing paymentId" }, 400);
    }
    if (!["approve", "complete", "cancel"].includes(action)) {
      return json({ error: "Invalid action" }, 400);
    }

    // Authenticated caller (Pi user session minted by the pi-auth function)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Always read the authoritative payment from the Pi API
    const paymentRes = await fetch(`${PI_API}/payments/${paymentId}`, {
      headers: piHeaders(apiKey),
    });
    if (!paymentRes.ok) {
      console.error("Pi payment lookup failed", paymentRes.status, await paymentRes.text());
      return json({ error: "Payment not found on Pi Network" }, 400);
    }
    const payment = await paymentRes.json();
    const meta = payment?.metadata ?? {};

    if (action === "cancel") {
      await admin
        .from("purchases")
        .update({ status: "cancelled" })
        .eq("payment_id", paymentId);
      return json({ ok: true, status: "cancelled" });
    }

    if (action === "approve") {
      // Validate the payment matches the digital product purchase the app expects
      const expected = body?.product ?? {};
      if (meta?.type !== "digital_product_purchase") {
        return json({ error: "Unexpected payment type" }, 400);
      }
      if (
        String(meta?.product_id ?? "") !== String(expected?.id ?? meta?.product_id) ||
        Number(payment?.amount) !== Number(expected?.amount ?? payment?.amount)
      ) {
        return json({ error: "Payment does not match the requested product" }, 400);
      }

      const { error: insertErr } = await admin.from("purchases").upsert(
        {
          user_id: userId,
          payment_id: paymentId,
          product_id: String(meta.product_id),
          product_title: String(meta.product_title ?? expected?.title ?? "Digital product"),
          amount: Number(payment.amount),
          memo: String(payment.memo ?? ""),
          metadata: meta,
          status: "approved",
        },
        { onConflict: "payment_id" },
      );
      if (insertErr) console.error("purchase upsert failed", insertErr);

      const approveRes = await fetch(`${PI_API}/payments/${paymentId}/approve`, {
        method: "POST",
        headers: piHeaders(apiKey),
      });
      if (!approveRes.ok) {
        console.error("approve failed", approveRes.status, await approveRes.text());
        return json({ error: "Could not approve payment" }, 502);
      }
      return json({ ok: true, status: "approved" });
    }

    // action === "complete"
    const txid = body?.txid;
    if (typeof txid !== "string" || !txid) return json({ error: "Missing txid" }, 400);

    const completeRes = await fetch(`${PI_API}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: piHeaders(apiKey),
      body: JSON.stringify({ txid }),
    });
    if (!completeRes.ok) {
      console.error("complete failed", completeRes.status, await completeRes.text());
      return json({ error: "Could not complete payment" }, 502);
    }

    const { error: updateErr } = await admin.from("purchases").upsert(
      {
        user_id: userId,
        payment_id: paymentId,
        product_id: String(meta?.product_id ?? "unknown"),
        product_title: String(meta?.product_title ?? "Digital product"),
        amount: Number(payment?.amount ?? 0),
        memo: String(payment?.memo ?? ""),
        metadata: meta,
        txid,
        status: "completed",
      },
      { onConflict: "payment_id" },
    );
    if (updateErr) console.error("purchase completion update failed", updateErr);

    return json({ ok: true, status: "completed", txid });
  } catch (e) {
    console.error("pi-payment error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
