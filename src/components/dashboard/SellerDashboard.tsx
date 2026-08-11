import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Boxes,
  Package,
  PlusCircle,
  Receipt,
  ShoppingCart,
  Store,
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
  trendPercent,
  withinPeriod,
  type PeriodId,
} from "@/components/dashboard/kit";
import { PLATFORM_COMMISSION_RATE } from "@/lib/admin";
import { useStore } from "@/lib/marketplace/store";

export function SellerDashboard() {
  const { user, products, orders } = useStore();
  const [period, setPeriod] = useState<PeriodId>("month");

  const myProducts = useMemo(
    () => products.filter((p) => p.seller === user?.username),
    [products, user],
  );

  /** Orders that contain at least one of my products. */
  const salesEntries = useMemo(() => {
    const ids = new Set(myProducts.map((p) => p.id));
    return orders.flatMap((order) =>
      order.items
        .filter((item) => ids.has(item.productId))
        .map((item) => ({
          key: `${order.id}-${item.productId}`,
          createdAt: order.createdAt,
          name: item.name,
          quantity: item.quantity,
          value: item.price * item.quantity,
          txid: order.txid,
        })),
    );
  }, [orders, myProducts]);

  const inPeriod = salesEntries.filter((e) => withinPeriod(e.createdAt, period));
  const gross = inPeriod.reduce((s, e) => s + e.value, 0);
  const fees = gross * PLATFORM_COMMISSION_RATE;
  const series = useMemo(() => buildSeries(salesEntries, 30), [salesEntries]);

  return (
    <>
      <DashboardHeader
        title="Seller dashboard"
        subtitle="Your marketplace listings, orders and Pi balance"
        icon={Store}
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard
          label="Available balance"
          value={`${(gross - fees).toFixed(2)} π`}
          icon={Wallet}
          accent="gold"
          hint={`after ${Math.round(PLATFORM_COMMISSION_RATE * 100)}% fee`}
        />
        <StatCard
          label="Gross revenue"
          value={`${gross.toFixed(2)} π`}
          icon={BadgeDollarSign}
          trend={trendPercent(series)}
          accent="success"
        />
        <StatCard label="Orders received" value={inPeriod.length} icon={Receipt} hint="This period" />
        <StatCard label="Products listed" value={myProducts.length} icon={Boxes} />
      </StatGrid>

      <Section title="Revenue" description="Last 30 days of marketplace sales">
        <BarChart series={series} emptyLabel="No sales yet — list a product to get your first Pi." />
      </Section>

      <Section
        title="Orders received"
        action={
          <span className="text-xs text-muted-foreground">{salesEntries.length} total</span>
        }
      >
        {salesEntries.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No order yet"
            description="As soon as a buyer pays in Pi for one of your products, it shows up here."
            actionLabel="List a product"
            to="/sell"
          />
        ) : (
          <ActivityList>
            {salesEntries.slice(0, 10).map((sale) => (
              <ActivityRow
                key={sale.key}
                title={sale.name}
                meta={`${new Date(sale.createdAt).toLocaleDateString()} · ×${sale.quantity}`}
                badge={<StatusBadge tone="success">paid</StatusBadge>}
                amount={`${sale.value.toFixed(2)} π`}
              />
            ))}
          </ActivityList>
        )}
      </Section>

      <Section title="My products">
        {myProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nothing on sale yet"
            description="Add your first product — it takes less than a minute and buyers pay you directly in Pi."
            actionLabel="Add a product"
            to="/sell"
          />
        ) : (
          <ActivityList>
            {myProducts.map((product) => (
              <ActivityRow
                key={product.id}
                to="/product/$id"
                params={{ id: product.id }}
                title={product.name}
                meta={product.description.slice(0, 60)}
                badge={<StatusBadge tone="info">live</StatusBadge>}
                amount={`${product.price} π`}
              />
            ))}
          </ActivityList>
        )}
      </Section>

      <Section title="Quick actions">
        <QuickActions
          actions={[
            { label: "New product", to: "/sell", icon: PlusCircle, primary: true },
            { label: "Withdraw earnings", to: "/sell", icon: Wallet },
            { label: "View shop", to: "/", icon: Store },
            { label: "My purchases", to: "/orders", icon: Receipt },
          ]}
        />
      </Section>
    </>
  );
}
