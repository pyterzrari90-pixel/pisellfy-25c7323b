import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_purchases",
  title: "List my purchases",
  description:
    "List the signed-in user's Pi digital product purchases, newest first, optionally filtered by status.",
  inputSchema: {
    status: z
      .enum(["pending", "approved", "completed", "cancelled"])
      .optional()
      .describe("Only return purchases with this status."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum number of purchases to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("purchases")
      .select("id, payment_id, product_id, product_title, amount, memo, status, txid, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { purchases: data ?? [] },
    };
  },
});
