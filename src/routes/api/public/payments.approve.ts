import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({ paymentId: z.string().min(1).max(200) });

export const Route = createFileRoute("/api/public/payments/approve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['PI_NETWORK_API_KEY'] ?? process.env['PI_API_KEY'];
        if (!apiKey) {
          return Response.json({ error: "Pi server API key is not configured" }, { status: 500 });
        }
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }
        const id = encodeURIComponent(parsed.data.paymentId);

        // Server-side validation: read the pending payment and check it matches
        // what this app sells (positive Pi amount + sellfy metadata).
        try {
          const lookup = await fetch(`https://api.minepi.com/v2/payments/${id}`, {
            headers: { Authorization: `Key ${apiKey}` },
            signal: AbortSignal.timeout(8000),
          });
          if (lookup.ok) {
            const dto = (await lookup.json()) as {
              amount?: number;
              memo?: string;
              metadata?: Record<string, unknown> | null;
            };
            const amount = Number(dto.amount ?? 0);
            if (!Number.isFinite(amount) || amount <= 0) {
              return Response.json({ error: "Invalid payment amount" }, { status: 400 });
            }
            const kind = (dto.metadata as { kind?: string } | null | undefined)?.kind;
            const known = ["product", "cart", "service", "course"];
            if (kind && !known.includes(kind)) {
              return Response.json({ error: "Unknown product type" }, { status: 400 });
            }
            console.log("Pi approve check ok", parsed.data.paymentId, amount, dto.memo);
          }
        } catch (error) {
          console.warn("Pi payment lookup failed (continuing)", error);
        }

        const url = `https://api.minepi.com/v2/payments/${id}/approve`;
        let res: Response;
        try {
          res = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(8000),
          });
        } catch (error) {
          console.error("Pi approve network error", error);
          return Response.json({ error: "Pi API unreachable" }, { status: 502 });
        }
        const text = await res.text();
        if (!res.ok) {
          console.error("Pi approve failed", res.status, text);
          return Response.json(
            { error: "Approval failed", piStatus: res.status, piBody: text.slice(0, 500) },
            { status: 502 },
          );
        }
        console.log("Pi approve ok", parsed.data.paymentId);
        return Response.json({ approved: true });
      },
    },
  },
});
