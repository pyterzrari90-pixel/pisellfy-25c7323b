import { useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Inbox,
  MessageSquare,
  PlusCircle,
  Star,
  Wallet,
} from "lucide-react";

import {
  ActivityList,
  ActivityRow,
  BarChart,
  DashboardHeader,
  EmptyState,
  PeriodFilter,
  QuickActions,
  Section,
  StatCard,
  StatGrid,
  StatusBadge,
  buildSeries,
  toneForStatus,
  trendPercent,
  withinPeriod,
  type PeriodId,
} from "@/components/dashboard/kit";
import { Stars } from "@/components/Stars";
import { useFreelance } from "@/lib/freelance/store";
import { averageRating, type ServiceOrderStatus } from "@/lib/freelance/types";
import { useStore } from "@/lib/marketplace/store";

const nextStatus: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  pending: "in_progress",
  in_progress: "delivered",
};

export function FreelanceDashboard() {
  const { user } = useStore();
  const { gigs, orders, reviews, messages, setOrderStatus, getProfile } = useFreelance();
  const [period, setPeriod] = useState<PeriodId>("month");

  const myGigs = useMemo(() => gigs.filter((g) => g.freelancerUid === user?.uid), [gigs, user]);
  const myOrders = useMemo(() => orders.filter((o) => o.sellerUid === user?.uid), [orders, user]);
  const inPeriod = myOrders.filter((o) => withinPeriod(o.createdAt, period));

  const released = inPeriod.filter((o) => o.escrow === "released").reduce((s, o) => s + o.price, 0);
  const held = inPeriod.filter((o) => o.escrow === "held").reduce((s, o) => s + o.price, 0);
  const myReviews = reviews.filter((r) => myGigs.some((g) => g.id === r.targetId));
  const profile = user ? getProfile(user.uid) : undefined;
  const series = useMemo(
    () => buildSeries(myOrders.map((o) => ({ createdAt: o.createdAt, value: o.price })), 30),
    [myOrders],
  );
  const unread = messages.filter((m) =>
    myOrders.some((o) => m.threadId === `order:${o.id}` && m.fromUid !== user?.uid),
  ).length;

  return (
    <>
      <DashboardHeader
        title="Freelance dashboard"
        subtitle={profile?.title ?? "Your gigs, orders and Pi escrow"}
        icon={Briefcase}
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard
          label="Available balance"
          value={`${released.toFixed(2)} π`}
          icon={Wallet}
          accent="gold"
          trend={trendPercent(series)}
          hint="escrow released"
        />
        <StatCard label="In escrow" value={`${held.toFixed(2)} π`} icon={Clock} accent="muted" hint="Pending delivery" />
        <StatCard
          label="Active orders"
          value={myOrders.filter((o) => o.status !== "completed").length}
          icon={Inbox}
          accent="success"
        />
        <StatCard
          label="Rating"
          value={<Stars rating={averageRating(myReviews)} count={myReviews.length} />}
          icon={Star}
        />
      </StatGrid>

      <Section title="Earnings" description="Last 30 days of freelance orders">
        <BarChart series={series} emptyLabel="No order yet — publish a gig and your earnings will show here." />
      </Section>

      <Section title="Incoming orders" description="Advance each order until delivery">
        {myOrders.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No order yet"
            description="Buyers pay upfront in Pi and funds stay in escrow until you deliver. Publish a gig to get started."
            actionLabel="Create a gig"
            to="/services/new"
          />
        ) : (
          <ul className="space-y-3">
            {myOrders.slice(0, 8).map((order) => {
              const next = nextStatus[order.status];
              return (
                <li
                  key={order.id}
                  className="animate-fade-up rounded-2xl border border-border bg-gradient-card p-4 shadow-soft"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{order.gigTitle}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        @{order.buyerName} · {order.tier}
                        <StatusBadge tone={toneForStatus(order.status)}>
                          {order.status.replace("_", " ")}
                        </StatusBadge>
                        <StatusBadge tone={toneForStatus(order.escrow)}>escrow {order.escrow}</StatusBadge>
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">{order.price} π</span>
                  </div>
                  {next && (
                    <button
                      onClick={() => setOrderStatus(order.id, next)}
                      className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark as {next.replace("_", " ")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="My gigs" action={<span className="text-xs text-muted-foreground">{myGigs.length} live</span>}>
        {myGigs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No gig published yet"
            description="Show the world what you do best — create your first gig and start earning Pi."
            actionLabel="Create a gig"
            to="/services/new"
          />
        ) : (
          <ActivityList>
            {myGigs.map((gig) => (
              <ActivityRow
                key={gig.id}
                to="/services/$id"
                params={{ id: gig.id }}
                title={gig.title}
                meta={gig.category}
                badge={<StatusBadge tone="info">live</StatusBadge>}
                amount={`from ${Math.min(...gig.packages.map((p) => p.price))} π`}
              />
            ))}
          </ActivityList>
        )}
      </Section>

      <Section title="Quick actions">
        <QuickActions
          actions={[
            { label: "New gig", to: "/services/new", icon: PlusCircle, primary: true },
            { label: "Withdraw earnings", to: "/services/dashboard", icon: Wallet },
            { label: `Messages (${unread})`, to: "/services/orders", icon: MessageSquare },
            { label: "Edit profile", to: "/services/become", icon: Briefcase },
          ]}
        />
      </Section>
    </>
  );
}
