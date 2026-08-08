import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_purchase",
  title: "Get purchase",
  description:
    "Look up one of the signed-in user's purchases by its Pi payment id, including status and blockchain txid.",
  inputSchema: {
    payment_id: z.string().trim().min(1).describe("The Pi payment identifier of the purchase."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ payment_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "id, payment_id, product_id, product_title, amount, memo, metadata, status, txid, created_at, updated_at",
      )
      .eq("user_id", ctx.getUserId())
      .eq("payment_id", payment_id)
      .maybeSingle();

    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError(`No purchase found with payment id ${payment_id}.`);

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { purchase: data },
    };
  },
});
