import { useMemo, useState } from "react";
import {
  BookOpen,
  Compass,
  GraduationCap,
  PackageSearch,
  Receipt,
  ShoppingBag,
  ShoppingCart,
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
import { useCourses } from "@/lib/courses/store";
import { courseLessons } from "@/lib/courses/types";
import { useFreelance } from "@/lib/freelance/store";
import { useStore } from "@/lib/marketplace/store";

export function BuyerDashboard() {
  const { user, orders } = useStore();
  const { orders: serviceOrders } = useFreelance();
  const { courses, enrollments, progress } = useCourses();
  const [period, setPeriod] = useState<PeriodId>("month");

  const myServiceOrders = serviceOrders.filter((o) => o.buyerUid === user?.uid);
  const myEnrollments = enrollments.filter((e) => e.uid === user?.uid);

  const spendEntries = useMemo(
    () => [
      ...orders.map((o) => ({ createdAt: o.createdAt, value: o.total })),
      ...myServiceOrders.map((o) => ({ createdAt: o.createdAt, value: o.price })),
      ...myEnrollments.map((e) => ({ createdAt: e.createdAt, value: e.price })),
    ],
    [orders, myServiceOrders, myEnrollments],
  );

  const inPeriod = spendEntries.filter((e) => withinPeriod(e.createdAt, period));
  const spent = inPeriod.reduce((s, e) => s + e.value, 0);
  const series = useMemo(() => buildSeries(spendEntries, 30), [spendEntries]);
  const activeServices = myServiceOrders.filter((o) => o.status !== "completed").length;

  const activity = [
    ...orders.map((o) => ({
      key: o.id,
      title: o.items.map((i) => i.name).join(", ") || "Marketplace order",
      meta: new Date(o.createdAt).toLocaleDateString(),
      amount: o.total,
      status: "paid",
      createdAt: o.createdAt,
    })),
    ...myServiceOrders.map((o) => ({
      key: o.id,
      title: o.gigTitle,
      meta: `Service · @${o.sellerName}`,
      amount: o.price,
      status: o.status,
      createdAt: o.createdAt,
    })),
    ...myEnrollments.map((e) => ({
      key: e.id,
      title: courses.find((c) => c.id === e.courseId)?.title ?? "Course",
      meta: "Course enrolment",
      amount: e.price,
      status: "completed",
      createdAt: e.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <>
      <DashboardHeader
        title="Buyer dashboard"
        subtitle={`Everything you bought with Pi${user ? ` — @${user.username}` : ""}`}
        icon={ShoppingBag}
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard
          label="Total spent"
          value={`${spent.toFixed(2)} π`}
          icon={Wallet}
          trend={trendPercent(series)}
          hint="vs previous period"
          accent="gold"
        />
        <StatCard label="Orders" value={orders.length} icon={Receipt} hint="Marketplace purchases" />
        <StatCard
          label="Active services"
          value={activeServices}
          icon={PackageSearch}
          accent="success"
          hint="In progress"
        />
        <StatCard label="Courses" value={myEnrollments.length} icon={GraduationCap} hint="Enrolled" />
      </StatGrid>

      <Section title="Spending" description="Last 30 days, all Pi purchases">
        <BarChart series={series} emptyLabel="No purchases yet — your spending curve starts here." />
      </Section>

      <Section title="Recent activity">
        {activity.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Nothing bought yet"
            description="Browse the marketplace, hire a freelancer or enrol in a course — everything is paid in Pi."
            actionLabel="Explore sellfy"
            to="/"
          />
        ) : (
          <ActivityList>
            {activity.map((item) => (
              <ActivityRow
                key={item.key}
                title={item.title}
                meta={item.meta}
                badge={<StatusBadge tone={toneForStatus(item.status)}>{item.status.replace("_", " ")}</StatusBadge>}
                amount={`${item.amount.toFixed(2)} π`}
              />
            ))}
          </ActivityList>
        )}
      </Section>

      <Section title="My learning">
        {myEnrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No course started yet"
            description="Pick a course and start learning today — your progress is tracked here."
            actionLabel="Browse courses"
            to="/courses"
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {myEnrollments.map((enrollment) => {
              const course = courses.find((c) => c.id === enrollment.courseId);
              if (!course || !user) return null;
              const pct = progress(course.id, user.uid, courseLessons(course).length);
              return (
                <li
                  key={enrollment.id}
                  className="animate-fade-up rounded-2xl border border-border bg-gradient-card p-4 shadow-soft"
                >
                  <p className="line-clamp-1 text-sm font-semibold">{course.title}</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{pct}% complete</p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Quick actions">
        <QuickActions
          actions={[
            { label: "Explore shop", to: "/", icon: Compass, primary: true },
            { label: "My cart", to: "/cart", icon: ShoppingCart },
            { label: "Service orders", to: "/services/orders", icon: PackageSearch },
            { label: "My learning", to: "/courses/my", icon: GraduationCap },
          ]}
        />
      </Section>
    </>
  );
}
