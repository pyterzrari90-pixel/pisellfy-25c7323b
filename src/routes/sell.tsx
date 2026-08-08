import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell on sellfy — list a product in Pi" },
      { name: "description", content: "List a product on sellfy and get paid in Pi." },
      { property: "og:title", content: "Sell on sellfy" },
      { property: "og:description", content: "List a product and get paid in Pi." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">List a product</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set your price in Pi. Buyers pay in Pi only.</p>
      <div className="mt-4">
        <PiSignInGate>
          <SellForm />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function SellForm() {
  const { addProduct } = useStore();
  const [done, setDone] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price"));
    if (!Number.isFinite(price) || price <= 0) return;
    addProduct({
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      price,
      image:
        String(form.get("image") ?? "").trim() ||
        "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=800&q=70",
    });
    event.currentTarget.reset();
    setDone(true);
  }

  const field =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Product name
        </label>
        <input id="name" name="name" required maxLength={80} className={field} />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea id="description" name="description" required rows={3} maxLength={600} className={field} />
      </div>
      <div>
        <label htmlFor="price" className="text-sm font-medium">
          Price (π)
        </label>
        <input id="price" name="price" type="number" step="0.01" min="0.01" required className={field} />
      </div>
      <div>
        <label htmlFor="image" className="text-sm font-medium">
          Image URL
        </label>
        <input id="image" name="image" type="url" placeholder="https://…" className={field} />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Publish product
      </button>
      {done && <p className="text-sm text-muted-foreground">Product published to the marketplace.</p>}
    </form>
  );
}
