import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

/**
 * Freelance services are shared data: they live in the `services` table.
 * Ownership is derived from the Pi access token (this app has no Supabase
 * auth), verified server-side against GET https://api.minepi.com/v2/me.
 */

const packageSchema = z.object({
  tier: z.enum(["basic", "standard", "premium"]),
  title: z.string().max(120),
  description: z.string().max(400).default(""),
  price: z.number().positive(),
  deliveryDays: z.number().int().positive(),
});

const gigInput = z.object({
  accessToken: z.string().min(10),
  title: z.string().min(1).max(120),
  description: z.string().max(1500).default(""),
  category: z.string().max(40),
  images: z.array(z.string().url()).max(8),
  packages: z.array(packageSchema).min(1).max(3),
});

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Never trust an owner id sent by the client: resolve it from the Pi token. */
async function requirePiUser(accessToken: string): Promise<{ uid: string; username: string }> {
  const res = await fetch("https://api.minepi.com/v2/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Pi session invalid — please sign in again.");
  const me = (await res.json()) as { uid?: string; username?: string };
  if (!me.uid) throw new Error("Pi session invalid — please sign in again.");
  return { uid: me.uid, username: me.username ?? "" };
}

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const createService = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => gigInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requirePiUser(data.accessToken);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("services")
      .insert({
        owner_id: user.uid,
        owner_name: user.username,
        title: data.title,
        description: data.description,
        category: data.category,
        images: data.images,
        packages: data.packages,
        status: "published",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateService = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    gigInput.partial({ title: true }).extend({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requirePiUser(data.accessToken);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("services")
      .update({
        ...(data.title ? { title: data.title } : {}),
        description: data.description,
        category: data.category,
        images: data.images,
        packages: data.packages,
      })
      .eq("id", data.id)
      .eq("owner_id", user.uid)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("You can only edit your own services.");
    return row;
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ accessToken: z.string().min(10), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requirePiUser(data.accessToken);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("services")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", user.uid)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("You can only delete your own services.");
    return { id: row.id };
  });
