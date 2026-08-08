import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { Stars } from "@/components/Stars";
import { useFreelance } from "@/lib/freelance/store";
import { averageRating, type ServiceOrderStatus } from "@/lib/freelance/types";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/services/dashboard")({
  head: () => ({
    meta: [
      { title: "Freelancer dashboard — sellfy" },
      { name: "description", content: "Track your gigs, active orders, Pi earnings and buyer messages." },
      { property: "og:title", content: "Freelancer dashboard — sellfy" },
      { property: "og:description", content: "Orders, earnings and messages for sellfy freelancers." },
    ],
  }),
  component: DashboardPage,
});

const nextStatus: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  pending: "in_progress",
  in_progress: "delivered",
};

function DashboardPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Freelancer dashboard</h1>
      <div className="mt-4">
        <PiSignInGate>
          <Dashboard />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function Dashboard() {
  const { user } = useStore();
  const { gigs, orders, reviews, messages, setOrderStatus, sendMessage, getProfile } = useFreelance();
  const [thread, setThread] = useState<string | null>(null);

  const myGigs = useMemo(
    () => gigs.filter((g) => g.freelancerUid === user?.uid),
    [gigs, user],
  );
  const myOrders = useMemo(
    () => orders.filter((o) => o.sellerUid === user?.uid),
    [orders, user],
  );
  const earnings = myOrders
    .filter((o) => o.escrow === "released")
    .reduce((sum, o) => sum + o.price, 0);
  const pending = myOrders
    .filter((o) => o.escrow === "held")
    .reduce((sum, o) => sum + o.price, 0);
  const myReviews = reviews.filter((r) => myGigs.some((g) => g.id === r.targetId));
  const profile = user ? getProfile(user.uid) : undefined;

  function onSend(event: FormEvent<HTMLFormElement>, threadId: string) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") ?? "").trim().slice(0, 500);
    if (!text) return;
    sendMessage(threadId, user.uid, user.username, text);
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      {!profile && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          You have no freelancer profile yet.{" "}
          <Link to="/services/become" className="text-primary underline underline-offset-2">
            Create one
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Released earnings" value={`${earnings.toFixed(2)} π`} />
        <Stat label="In escrow" value={`${pending.toFixed(2)} π`} />
        <Stat label="Active orders" value={String(myOrders.filter((o) => o.status !== "completed").length)} />
        <Stat label="Rating" value={<Stars rating={averageRating(myReviews)} count={myReviews.length} />} />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My gigs</h2>
          <Link to="/services/new" className="text-sm text-primary underline underline-offset-2">
            + New gig
          </Link>
        </div>
        {myGigs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No gigs published yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myGigs.map((gig) => (
              <li key={gig.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                <Link to="/services/$id" params={{ id: gig.id }} className="font-medium hover:text-primary">
                  {gig.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {gig.category} · from {Math.min(...gig.packages.map((p) => p.price))} π
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Incoming orders</h2>
        {myOrders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myOrders.map((order) => {
              const threadId = `order:${order.id}`;
              const convo = messages.filter((m) => m.threadId === threadId);
              const next = nextStatus[order.status];
              return (
                <li key={order.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{order.gigTitle}</span>
                    <span className="text-sm font-semibold text-primary">{order.price} π</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    @{order.buyerName} · {order.tier} · status:{" "}
                    <span className="font-medium text-foreground">{order.status.replace("_", " ")}</span>{" "}
                    · escrow: {order.escrow}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {next && (
                      <button
                        onClick={() => setOrderStatus(order.id, next)}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        Mark as {next.replace("_", " ")}
                      </button>
                    )}
                    <button
                      onClick={() => setThread(thread === threadId ? null : threadId)}
                      className="rounded-md border border-input px-3 py-1.5 text-xs"
                    >
                      Messages ({convo.length})
                    </button>
                  </div>
                  {thread === threadId && (
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
                          placeholder="Reply to the buyer…"
                          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                          Send
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
