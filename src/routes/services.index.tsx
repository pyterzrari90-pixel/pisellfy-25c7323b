import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Stars } from "@/components/Stars";
import { useFreelance } from "@/lib/freelance/store";
import { GIG_CATEGORIES, averageRating } from "@/lib/freelance/types";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Freelance Services — hire and pay in Pi | sellfy" },
      {
        name: "description",
        content:
          "Browse freelance gigs in design, development, marketing, writing and video. Order with Pi, funds held in escrow until delivery.",
      },
      { property: "og:title", content: "Freelance Services on sellfy" },
      { property: "og:description", content: "Hire freelancers and pay in Pi with escrow protection." },
    ],
  }),
  component: ServicesCatalog,
});

function ServicesCatalog() {
  const { gigs, reviews } = useFreelance();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minRating, setMinRating] = useState(0);
  const [maxDays, setMaxDays] = useState<string>("");

  const results = useMemo(() => {
    return gigs.filter((gig) => {
      const cheapest = Math.min(...gig.packages.map((p) => p.price));
      const fastest = Math.min(...gig.packages.map((p) => p.deliveryDays));
      const rating = averageRating(reviews.filter((r) => r.targetId === gig.id));
      if (query && !`${gig.title} ${gig.description}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (category !== "all" && gig.category !== category) return false;
      if (maxPrice && cheapest > Number(maxPrice)) return false;
      if (maxDays && fastest > Number(maxDays)) return false;
      if (minRating && rating < minRating) return false;
      return true;
    });
  }, [gigs, reviews, query, category, maxPrice, maxDays, minRating]);

  const field =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <AppShell>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Freelance Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hire talent and pay in Pi. Funds stay in escrow until you accept the delivery.
        </p>
      </section>

      <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services…"
          maxLength={80}
          className={field}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full border px-3 py-1 text-xs ${category === "all" ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
          >
            All
          </button>
          {GIG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-xs text-muted-foreground">
            Max price (π)
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Max delivery (days)
            <input
              type="number"
              min="0"
              value={maxDays}
              onChange={(e) => setMaxDays(e.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Min rating
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className={field}
            >
              <option value={0}>Any</option>
              <option value={3}>3★ and up</option>
              <option value={4}>4★ and up</option>
              <option value={4.5}>4.5★ and up</option>
            </select>
          </label>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((gig) => {
          const gigReviews = reviews.filter((r) => r.targetId === gig.id);
          const cheapest = Math.min(...gig.packages.map((p) => p.price));
          return (
            <Link
              key={gig.id}
              to="/services/$id"
              params={{ id: gig.id }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
            >
              <img
                src={gig.images[0]}
                alt={gig.title}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
              <div className="p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {gig.category}
                </p>
                <h2 className="mt-1 line-clamp-2 text-sm font-medium">{gig.title}</h2>
                <div className="mt-2 flex items-center justify-between">
                  <Stars rating={averageRating(gigReviews)} count={gigReviews.length} />
                  <span className="text-sm font-semibold text-primary">from {cheapest} π</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">@{gig.freelancerName}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {results.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No service matches those filters.</p>
      )}
    </AppShell>
  );
}
