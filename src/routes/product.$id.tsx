import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInCard } from "@/components/PiSignIn";
import { useStore } from "@/lib/marketplace/store";
import { usePiCheckout } from "@/lib/marketplace/use-pi-checkout";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product — sellfy" },
      { name: "description", content: "Product details and Pi payment on the sellfy marketplace." },
      { property: "og:title", content: "Product — sellfy" },
      { property: "og:description", content: "Buy this item with Pi on sellfy." },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = useParams({ from: "/product/$id" });
  const { products, user, hydrated, addToCart } = useStore();
  const { status, payWithPi } = usePiCheckout();
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">This product is no longer available.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6 sm:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full rounded-2xl border border-border object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">Sold by @{product.seller}</p>
          <p className="mt-4 text-3xl font-bold text-primary">{product.price} π</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {hydrated && !user ? (
            <div className="mt-6">
              <PiSignInCard />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => void payWithPi([{ productId: product.id, quantity: 1 }], `sellfy: ${product.name}`)}
                disabled={status.state === "pending"}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status.state === "pending" ? "Processing…" : "Pay with Pi"}
              </button>
              <button
                onClick={() => {
                  addToCart(product.id);
                  setAdded(true);
                }}
                className="w-full rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                {added ? "Added to cart" : "Add to cart"}
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
        </div>
      </div>
    </AppShell>
  );
}
