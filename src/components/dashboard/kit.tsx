import { Link } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideProps } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Period filter                                                       */
/* ------------------------------------------------------------------ */

export const PERIODS = [
  { id: "week", label: "This week", days: 7 },
  { id: "month", label: "This month", days: 30 },
  { id: "all", label: "All time", days: 3650 },
] as const;

export type PeriodId = (typeof PERIODS)[number]["id"];

export function periodDays(id: PeriodId): number {
  return PERIODS.find((p) => p.id === id)?.days ?? 30;
}

export function withinPeriod(iso: string, id: PeriodId): boolean {
  const days = periodDays(id);
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  return Date.now() - t <= days * 86_400_000;
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodId;
  onChange: (value: PeriodId) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1 text-xs">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`min-h-9 rounded-lg px-3 py-1.5 font-medium transition-colors ${
            value === p.id
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header + sections                                                   */
/* ------------------------------------------------------------------ */

export function DashboardHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<LucideProps>;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>
      </div>
      {actions}
    </header>
  );
}

export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
          {description && <p className="truncate text-xs text-muted-foreground/80">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition-all duration-300 hover:border-primary/40 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ComponentType<LucideProps>;
  trend?: number | null;
  accent?: "primary" | "gold" | "success" | "muted";
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    gold: "bg-gold/15 text-gold",
    success: "bg-success/15 text-success",
    muted: "bg-muted text-muted-foreground",
  };
  const up = (trend ?? 0) >= 0;
  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${accents[accent]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {typeof trend === "number" && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              up ? "text-success" : "text-destructive"
            }`}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {up ? "+" : ""}
            {trend}%
          </span>
        )}
        {hint && <span className="truncate text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Chart — last 30 days                                                */
/* ------------------------------------------------------------------ */

export interface Dated {
  date: string;
  value: number;
}

/** Buckets timestamped amounts into the last `days` days. */
export function buildSeries(
  entries: { createdAt: string; value: number }[],
  days = 30,
): Dated[] {
  const out: Dated[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    out.push({ date: d.toISOString().slice(0, 10), value: 0 });
  }
  const index = new Map(out.map((p, i) => [p.date, i]));
  for (const e of entries) {
    const key = new Date(e.createdAt).toISOString().slice(0, 10);
    const i = index.get(key);
    if (i !== undefined) out[i]!.value += e.value;
  }
  return out;
}

export function trendPercent(series: Dated[]): number {
  const half = Math.floor(series.length / 2);
  const prev = series.slice(0, half).reduce((s, p) => s + p.value, 0);
  const curr = series.slice(half).reduce((s, p) => s + p.value, 0);
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export function BarChart({
  series,
  unit = "π",
  emptyLabel = "No activity in this period yet.",
}: {
  series: Dated[];
  unit?: string;
  emptyLabel?: string;
}) {
  const max = Math.max(...series.map((p) => p.value), 0);
  const total = series.reduce((s, p) => s + p.value, 0);

  if (max <= 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-bold">
          {total.toFixed(2)} <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </p>
        <p className="text-xs text-muted-foreground">Last {series.length} days</p>
      </div>
      <div className="mt-4 flex h-28 items-end gap-[2px]">
        {series.map((p) => (
          <div
            key={p.date}
            title={`${p.date}: ${p.value.toFixed(2)} ${unit}`}
            className="flex-1 rounded-t-[3px] bg-gradient-bar transition-all duration-500 hover:opacity-80"
            style={{ height: `${Math.max(3, (p.value / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{series[0]?.date.slice(5)}</span>
        <span>{series[series.length - 1]?.date.slice(5)}</span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

export type StatusTone = "pending" | "success" | "danger" | "info";

const toneClass: Record<StatusTone, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

/** Shared status → colour mapping used by every dashboard. */
export function toneForStatus(status: string): StatusTone {
  switch (status) {
    case "completed":
    case "released":
    case "delivered":
    case "paid":
      return "success";
    case "cancelled":
    case "failed":
    case "refunded":
      return "danger";
    case "pending":
    case "held":
      return "pending";
    default:
      return "info";
  }
}

/* ------------------------------------------------------------------ */
/* Activity list + empty state + quick actions                         */
/* ------------------------------------------------------------------ */

export function ActivityList({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">{children}</ul>;
}

export function ActivityRow({
  title,
  meta,
  amount,
  badge,
  to,
  params,
}: {
  title: ReactNode;
  meta: ReactNode;
  amount?: ReactNode;
  badge?: ReactNode;
  to?: string;
  params?: Record<string, string>;
}) {
  const body = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {meta}
          {badge}
        </p>
      </div>
      {amount !== undefined && (
        <span className="shrink-0 text-sm font-semibold text-primary">{amount}</span>
      )}
    </div>
  );
  return (
    <li>
      {to ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Link to={to as any} params={params as any} className="block min-h-14">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  to,
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  actionLabel?: string;
  to?: string;
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {actionLabel && to && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Link
          to={to as any}
          className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function QuickActions({
  actions,
}: {
  actions: { label: string; to?: string; onClick?: () => void; icon: ComponentType<LucideProps>; primary?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => {
        const className = `flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-center text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
          a.primary
            ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow"
            : "border-border bg-card text-foreground hover:border-primary/40"
        }`;
        const inner = (
          <>
            <a.icon className="h-4 w-4" />
            <span className="leading-tight">{a.label}</span>
          </>
        );
        return a.to ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link key={a.label} to={a.to as any} className={className}>
            {inner}
          </Link>
        ) : (
          <button key={a.label} type="button" onClick={a.onClick} className={className}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
