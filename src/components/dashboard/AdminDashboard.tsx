import { useMemo, useState } from "react";
import {
  Activity,
  Briefcase,
  Coins,
  GraduationCap,
  Layers,
  PieChart,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

import {
  ActivityList,
  ActivityRow,
  BarChart,
  Card,
  DashboardHeader,
  EmptyState,
  PeriodFilter,
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
import { PLATFORM_COMMISSION_RATE } from "@/lib/admin";
import { useCourses } from "@/lib/courses/store";
import { useFreelance } from "@/lib/freelance/store";
import { useStore } from "@/lib/marketplace/store";

export function AdminDashboard() {
  const { products, orders } = useStore();
  const { gigs, orders: serviceOrders, profiles } = useFreelance();
  const { courses, enrollments, instructors } = useCourses();
  const [period, setPeriod] = useState<PeriodId>("month");

  const entries = useMemo(
    () => [
      ...orders.map((o) => ({
        key: o.id,
        source: "Marketplace" as const,
        title: o.items.map((i) => i.name).join(", ") || "Order",
        createdAt: o.createdAt,
        value: o.total,
        status: "paid",
      })),
      ...serviceOrders.map((o) => ({
        key: o.id,
        source: "Services" as const,
        title: o.gigTitle,
        createdAt: o.createdAt,
        value: o.price,
        status: o.status,
      })),
      ...enrollments.map((e) => ({
        key: e.id,
        source: "Courses" as const,
        title: courses.find((c) => c.id === e.courseId)?.title ?? "Course",
        createdAt: e.createdAt,
        value: e.price,
        status: "completed",
      })),
    ],
    [orders, serviceOrders, enrollments, courses],
  );

  const inPeriod = entries.filter((e) => withinPeriod(e.createdAt, period));
  const gmv = inPeriod.reduce((s, e) => s + e.value, 0);
  const commissions = gmv * PLATFORM_COMMISSION_RATE;
  const series = useMemo(() => buildSeries(entries, 30), [entries]);

  const users = new Set<string>([
    ...profiles.map((p) => p.uid),
    ...instructors.map((i) => i.uid),
    ...serviceOrders.flatMap((o) => [o.buyerUid, o.sellerUid]),
    ...enrollments.map((e) => e.uid),
  ]);

  const perSource = (["Marketplace", "Services", "Courses"] as const).map((source) => {
    const total = inPeriod.filter((e) => e.source === source).reduce((s, e) => s + e.value, 0);
    return { source, total, share: gmv > 0 ? Math.round((total / gmv) * 100) : 0 };
  });

  return (
    <>
      <DashboardHeader
        title="Platform dashboard"
        subtitle="Restricted access — consolidated view of all sellfy activity"
        icon={ShieldCheck}
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard
          label="Commissions collected"
          value={`${commissions.toFixed(2)} π`}
          icon={Coins}
          accent="gold"
          trend={trendPercent(series)}
          hint={`${Math.round(PLATFORM_COMMISSION_RATE * 100)}% of GMV`}
        />
        <StatCard
          label="Platform GMV"
          value={`${gmv.toFixed(2)} π`}
          icon={Activity}
          accent="success"
          hint="This period"
        />
        <StatCard label="Users" value={users.size} icon={Users} hint="Buyers, sellers, instructors" />
        <StatCard
          label="Listings"
          value={products.length + gigs.length + courses.length}
          icon={Layers}
          hint={`${products.length} products · ${gigs.length} gigs · ${courses.length} courses`}
        />
      </StatGrid>

      <Section title="Platform volume" description="Last 30 days, all modules combined">
        <BarChart series={series} emptyLabel="No transaction recorded on the platform yet." />
      </Section>

      <Section title="Revenue split by module">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {perSource.map((row) => (
            <Card key={row.source}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  {row.source === "Marketplace" && <Store className="h-4 w-4 text-primary" />}
                  {row.source === "Services" && <Briefcase className="h-4 w-4 text-primary" />}
                  {row.source === "Courses" && <GraduationCap className="h-4 w-4 text-primary" />}
                  {row.source}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{row.share}%</span>
              </div>
              <p className="mt-2 text-xl font-bold">{row.total.toFixed(2)} π</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${row.share}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Recent platform activity">
        {entries.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="No activity yet"
            description="Once users start paying in Pi across the marketplace, services and courses, every transaction lands here."
          />
        ) : (
          <ActivityList>
            {[...entries]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 12)
              .map((entry) => (
                <ActivityRow
                  key={`${entry.source}-${entry.key}`}
                  title={entry.title}
                  meta={`${entry.source} · ${new Date(entry.createdAt).toLocaleDateString()}`}
                  badge={<StatusBadge tone={toneForStatus(entry.status)}>{entry.status.replace("_", " ")}</StatusBadge>}
                  amount={`${entry.value.toFixed(2)} π`}
                />
              ))}
          </ActivityList>
        )}
      </Section>
    </>
  );
}
