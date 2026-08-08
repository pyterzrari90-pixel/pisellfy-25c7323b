import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { PiSignInCard } from "@/components/PiSignIn";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "sellfy — Pi Network Marketplace" },
      {
        name: "description",
        content:
          "Buy and sell products with Pi. sellfy is a Pi Browser marketplace with Pi Sign-In and Pi-only payments.",
      },
      { property: "og:title", content: "sellfy — Pi Network Marketplace" },
      {
        property: "og:description",
        content: "Buy and sell products with Pi inside the Pi Browser.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { products, user, hydrated } = useStore();

  return (
    <AppShell>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every item is priced and paid in Pi. No cards, no other crypto.
        </p>
      </section>

      {hydrated && !user && (
        <div className="mt-6">
          <PiSignInCard />
        </div>
      )}

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            to="/product/$id"
            params={{ id: product.id }}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
          >
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <div className="p-3">
              <h2 className="truncate text-sm font-medium">{product.name}</h2>
              <p className="mt-1 text-sm font-semibold text-primary">{product.price} π</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">@{product.seller}</p>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
