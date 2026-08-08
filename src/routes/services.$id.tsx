import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInCard } from "@/components/PiSignIn";
import { ReviewList } from "@/components/Reviews";
import { useFreelance } from "@/lib/freelance/store";
import type { PackageTier } from "@/lib/freelance/types";
import { useStore } from "@/lib/marketplace/store";
import { usePiPayment } from "@/lib/pi/use-pi-payment";

export const Route = createFileRoute("/services/$id")({
  head: () => ({
    meta: [
      { title: "Service details — sellfy Freelance" },
      { name: "description", content: "Service packages, portfolio and reviews. Order and pay in Pi." },
      { property: "og:title", content: "Service details — sellfy Freelance" },
      { property: "og:description", content: "Order a freelance service and pay in Pi." },
    ],
  }),
  component: GigDetail,
  notFoundComponent: () => <AppShell>Service not found.</AppShell>,
});

function GigDetail() {
  const { id } = useParams({ from: "/services/$id" });
  const { user, hydrated } = useStore();
  const { gigs, reviews, messages, sendMessage, addOrder } = useFreelance();
  const { status, pay } = usePiPayment();
  const [tier, setTier] = useState<PackageTier>("basic");

  const gig = gigs.find((g) => g.id === id);
  const gigReviews = useMemo(() => reviews.filter((r) => r.targetId === id), [reviews, id]);
  const thread = useMemo(
    () => messages.filter((m) => m.threadId === `gig:${id}`),
    [messages, id],
  );

  if (!gig) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">
          This service doesn't exist.{" "}
          <Link to="/services" className="text-primary underline underline-offset-2">
            Browse services
          </Link>
        </p>
      </AppShell>
    );
  }

  const selected = gig.packages.find((p) => p.tier === tier) ?? gig.packages[0]!;

  function order() {
    if (!user || !gig) return;
    void pay(
      {
        amount: selected.price,
        memo: `sellfy service: ${gig.title.slice(0, 40)} (${selected.tier})`,
        metadata: { type: "service", gigId: gig.id, tier: selected.tier, uid: user.uid },
      },
      ({ paymentId, txid }) => {
        addOrder({
          gigId: gig.id,
          gigTitle: gig.title,
          tier: selected.tier,
          price: selected.price,
          deliveryDays: selected.deliveryDays,
          buyerUid: user.uid,
          buyerName: user.username,
          sellerUid: gig.freelancerUid,
          sellerName: gig.freelancerName,
          status: "pending",
          escrow: "held",
          paymentId,
          txid,
        });
      },
      `Paid ${selected.price} Pi. Funds are held in escrow until you accept the delivery.`,
    );
  }

  function onMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !gig) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") ?? "").trim().slice(0, 500);
    if (!text) return;
    sendMessage(`gig:${gig.id}`, user.uid, user.username, text);
    event.currentTarget.reset();
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">{gig.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {gig.category} · by @{gig.freelancerName}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {gig.images.map((src) => (
              <img
                key={src}
                src={src}
                alt={gig.title}
                loading="lazy"
                className="aspect-video w-full rounded-xl border border-border object-cover"
              />
            ))}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{gig.description}</p>

          <ReviewList reviews={gigReviews} />

          <section>
            <h2 className="text-lg font-semibold">Message the freelancer</h2>
            <ul className="mt-3 space-y-2">
              {thread.map((m) => (
                <li key={m.id} className="rounded-lg border border-border bg-card p-2 text-sm">
                  <span className="font-medium">@{m.fromName}</span>{" "}
                  <span className="text-muted-foreground">{m.text}</span>
                </li>
              ))}
              {thread.length === 0 && (
                <li className="text-sm text-muted-foreground">No messages yet.</li>
              )}
            </ul>
            {user ? (
              <form onSubmit={onMessage} className="mt-3 flex gap-2">
                <input
                  name="text"
                  maxLength={500}
                  placeholder="Ask a question before ordering…"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Send
                </button>
              </form>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Sign in with Pi to send a message.</p>
            )}
          </section>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-1">
              {gig.packages.map((p) => (
                <button
                  key={p.tier}
                  onClick={() => setTier(p.tier)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs capitalize ${
                    p.tier === tier
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "border border-input"
                  }`}
                >
                  {p.tier}
                </button>
              ))}
            </div>
            <h3 className="mt-3 text-sm font-semibold">{selected.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
            <p className="mt-3 text-2xl font-bold text-primary">{selected.price} π</p>
            <p className="text-xs text-muted-foreground">
              Delivery in {selected.deliveryDays} day{selected.deliveryDays > 1 ? "s" : ""}
            </p>

            {hydrated && !user ? (
              <div className="mt-4">
                <PiSignInCard />
              </div>
            ) : (
              <>
                <button
                  onClick={order}
                  disabled={status.state === "pending"}
                  className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {status.state === "pending" ? "Processing…" : "Order with Pi"}
                </button>
                {status.state !== "idle" && (
                  <p
                    className={`mt-2 text-sm ${status.state === "error" ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {status.message}
                  </p>
                )}
                {status.state === "success" && (
                  <Link
                    to="/services/orders"
                    className="mt-2 inline-block text-sm text-primary underline underline-offset-2"
                  >
                    Track your order
                  </Link>
                )}
              </>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Escrow: Pi is held by sellfy and released to the freelancer only when you accept the
              delivery.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
