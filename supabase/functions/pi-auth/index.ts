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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { accessToken } = await req.json().catch(() => ({}));
    if (!accessToken || typeof accessToken !== "string") {
      return json({ error: "Missing accessToken" }, 400);
    }

    // 1. Validate the Pi access token against the Pi Network API (no API key required)
    const piRes = await fetch("https://api.minepi.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!piRes.ok) {
      console.error("Pi token validation failed", piRes.status, await piRes.text());
      return json({ error: "Invalid Pi access token" }, 401);
    }

    const piUser = await piRes.json();
    const piUid: string | undefined = piUser?.uid;
    const piUsername: string = piUser?.username ?? "pioneer";
    if (!piUid) return json({ error: "Pi user has no uid" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 2. Deterministic synthetic email for this Pi identity
    const email = `pi_${piUid}@pi.local`;

    // 3. Find or create the auth user
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("pi_uid", piUid)
      .maybeSingle();

    let userId = existingProfile?.id as string | undefined;

    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { pi_uid: piUid, pi_username: piUsername },
      });
      if (createErr || !created?.user) {
        console.error("createUser failed", createErr);
        return json({ error: "Could not create session user" }, 500);
      }
      userId = created.user.id;
    }

    // 4. Keep the profile in sync
    const { error: upsertErr } = await admin
      .from("profiles")
      .upsert({ id: userId, pi_uid: piUid, pi_username: piUsername }, { onConflict: "id" });
    if (upsertErr) console.error("profile upsert failed", upsertErr);

    // 5. Mint a one-time link the client exchanges for a real session
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkErr || !link?.properties?.hashed_token) {
      console.error("generateLink failed", linkErr);
      return json({ error: "Could not establish session" }, 500);
    }

    return json({
      email,
      token_hash: link.properties.hashed_token,
      pi_uid: piUid,
      pi_username: piUsername,
    });
  } catch (e) {
    console.error("pi-auth error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
