import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { PiSignInCard } from "@/components/PiSignIn";
import { useStore } from "@/lib/marketplace/store";
import { usePiCheckout } from "@/lib/marketplace/use-pi-checkout";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — sellfy" },
      { name: "description", content: "Review your sellfy cart and pay in Pi." },
      { property: "og:title", content: "Cart — sellfy" },
      { property: "og:description", content: "Review your cart and pay with Pi." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, products, cartTotal, setQuantity, user, hydrated } = useStore();
  const { status, payWithPi } = usePiCheckout();

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>

      {cart.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your cart is empty.{" "}
          <Link to="/" className="text-primary underline underline-offset-2">
            Browse products
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {cart.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) return null;
              return (
                <li key={line.productId} className="flex items-center gap-3 p-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-sm text-primary">{product.price} π</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="h-8 w-8 rounded-md border border-input"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      className="h-8 w-8 rounded-md border border-input"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{cartTotal.toFixed(2)} π</span>
          </div>

          {hydrated && !user ? (
            <div className="mt-6">
              <PiSignInCard />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <button
                onClick={() => void payWithPi(cart, "sellfy cart checkout")}
                disabled={status.state === "pending"}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status.state === "pending" ? "Processing…" : "Pay with Pi"}
              </button>
              {status.state !== "idle" && (
                <p
                  className={
                    status.state === "error"
                      ? "text-sm text-destructive"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {status.message}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
