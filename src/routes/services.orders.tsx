import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { ReviewForm } from "@/components/Reviews";
import { useFreelance } from "@/lib/freelance/store";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/services/orders")({
  head: () => ({
    meta: [
      { title: "My service orders — sellfy" },
      { name: "description", content: "Track freelance orders, chat with sellers, release escrow and leave reviews." },
      { property: "og:title", content: "My service orders — sellfy" },
      { property: "og:description", content: "Track orders and release Pi escrow after delivery." },
    ],
  }),
  component: ServiceOrdersPage,
});

function ServiceOrdersPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">My service orders</h1>
      <div className="mt-4">
        <PiSignInGate>
          <OrderList />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function OrderList() {
  const { user } = useStore();
  const { orders, messages, sendMessage, releaseEscrow, addReview } = useFreelance();
  const [openThread, setOpenThread] = useState<string | null>(null);

  const myOrders = useMemo(
    () => orders.filter((o) => o.buyerUid === user?.uid),
    [orders, user],
  );

  function onSend(event: FormEvent<HTMLFormElement>, threadId: string) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") ?? "").trim().slice(0, 500);
    if (!text) return;
    sendMessage(threadId, user.uid, user.username, text);
    event.currentTarget.reset();
  }

  if (myOrders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You haven't ordered a service yet.{" "}
        <Link to="/services" className="text-primary underline underline-offset-2">
          Browse services
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {myOrders.map((order) => {
        const threadId = `order:${order.id}`;
        const convo = messages.filter((m) => m.threadId === threadId);
        return (
          <li key={order.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link to="/services/$id" params={{ id: order.gigId }} className="text-sm font-medium hover:text-primary">
                {order.gigTitle}
              </Link>
              <span className="text-sm font-semibold text-primary">{order.price} π</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              @{order.sellerName} · {order.tier} · {order.deliveryDays} day delivery · status:{" "}
              <span className="font-medium text-foreground">{order.status.replace("_", " ")}</span> ·
              escrow:{" "}
              <span className="font-medium text-foreground">
                {order.escrow === "held" ? "funds held" : "released"}
              </span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {order.status === "delivered" && order.escrow === "held" && (
                <button
                  onClick={() => releaseEscrow(order.id)}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Accept delivery & release {order.price} π
                </button>
              )}
              <button
                onClick={() => setOpenThread(openThread === threadId ? null : threadId)}
                className="rounded-md border border-input px-3 py-1.5 text-xs"
              >
                Messages ({convo.length})
              </button>
            </div>

            {openThread === threadId && (
              <div className="mt-3 space-y-2">
                {convo.map((m) => (
                  <p key={m.id} className="text-sm">
                    <span className="font-medium">@{m.fromName}</span>{" "}
                    <span className="text-muted-foreground">{m.text}</span>
                  </p>
                ))}
                <form onSubmit={(e) => onSend(e, threadId)} className="flex gap-2">
                  <input
                    name="text"
                    maxLength={500}
                    placeholder="Message the freelancer…"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                    Send
                  </button>
                </form>
              </div>
            )}

            {order.status === "completed" && user && (
              <div className="mt-3">
                <ReviewForm
                  label="Rate this service"
                  onSubmit={(rating, comment) =>
                    addReview({
                      targetId: order.gigId,
                      authorUid: user.uid,
                      authorName: user.username,
                      rating,
                      comment,
                    })
                  }
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
