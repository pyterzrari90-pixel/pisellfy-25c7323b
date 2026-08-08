import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  paymentId: z.string().min(1).max(200),
  txid: z.string().min(1).max(200),
});

export const Route = createFileRoute("/api/public/payments/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['PI_API_KEY'];
        if (!apiKey) {
          return Response.json({ error: "Pi server API key is not configured" }, { status: 500 });
        }
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }
        const res = await fetch(
          `https://api.minepi.com/v2/payments/${encodeURIComponent(parsed.data.paymentId)}/complete`,
          {
            method: "POST",
            headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ txid: parsed.data.txid }),
          },
        );
        if (!res.ok) {
          console.error("Pi complete failed", res.status, await res.text());
          return Response.json({ error: "Completion failed" }, { status: 502 });
        }
        return Response.json({ completed: true });
      },
    },
  },
});
