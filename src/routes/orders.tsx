import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Purchase history — sellfy" },
      { name: "description", content: "All of your sellfy purchases paid in Pi." },
      { property: "og:title", content: "Purchase history — sellfy" },
      { property: "og:description", content: "Your Pi purchases on sellfy." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = useStore();

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Purchase history</h1>
      <div className="mt-4">
        <PiSignInGate>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't bought anything yet.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <span className="text-base font-semibold text-primary">{order.total} π</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex justify-between">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-muted-foreground">{item.price} π</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 truncate text-xs text-muted-foreground">txid: {order.txid}</p>
                </li>
              ))}
            </ul>
          )}
        </PiSignInGate>
      </div>
    </AppShell>
  );
}
