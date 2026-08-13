import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useFreelance } from "@/lib/freelance/store";
import { GIG_CATEGORIES, type GigCategory, type PackageTier } from "@/lib/freelance/types";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/services/new")({
  head: () => ({
    meta: [
      { title: "Create a gig — sellfy Freelance" },
      { name: "description", content: "Publish a freelance gig with Basic, Standard and Premium packages priced in Pi." },
      { property: "og:title", content: "Create a gig on sellfy" },
      { property: "og:description", content: "Publish a service with three packages priced in Pi." },
    ],
  }),
  component: NewGigPage,
});

const field =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

const tiers: PackageTier[] = ["basic", "standard", "premium"];

function NewGigPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Create a service</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Three packages, one gig. Buyers pay in Pi, funds are escrowed until delivery.
      </p>
      <div className="mt-4">
        <PiSignInGate>
          <GigForm />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function GigForm() {
  const { user } = useStore();
  const { addGig } = useFreelance();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;
    const form = new FormData(event.currentTarget);
    const packages = tiers
      .map((tier) => ({
        tier,
        title: String(form.get(`${tier}-title`) ?? "").trim(),
        description: String(form.get(`${tier}-desc`) ?? "").trim(),
        price: Number(form.get(`${tier}-price`)),
        deliveryDays: Number(form.get(`${tier}-days`)),
      }))
      .filter((p) => p.title && Number.isFinite(p.price) && p.price > 0 && p.deliveryDays > 0);
    if (packages.length === 0) return;

    const images = String(form.get("images") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const gig = addGig({
      freelancerUid: user.uid,
      freelancerName: user.username,
      title: String(form.get("title") ?? "").trim().slice(0, 120),
      description: String(form.get("description") ?? "").trim().slice(0, 1500),
      category: String(form.get("category") ?? "Design") as GigCategory,
      images:
        images.length > 0
          ? images
          : ["https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=900&q=70"],
      packages,
    });
    void navigate({ to: "/services/$id", params: { id: gig.id } });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Gig title
        </label>
        <input id="title" name="title" required maxLength={120} placeholder="I will…" className={field} />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea id="description" name="description" required rows={4} maxLength={1500} className={field} />
      </div>
      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select id="category" name="category" className={field}>
          {GIG_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="images" className="text-sm font-medium">
          Portfolio image URLs (comma separated)
        </label>
        <input id="images" name="images" maxLength={600} placeholder="https://…, https://…" className={field} />
      </div>

      {tiers.map((tier) => (
        <fieldset key={tier} className="rounded-lg border border-border p-3">
          <legend className="px-1 text-sm font-semibold capitalize">{tier} package</legend>
          <input name={`${tier}-title`} required={tier === "basic"} maxLength={60} placeholder="Package name" className={field} />
          <input name={`${tier}-desc`} maxLength={200} placeholder="What's included" className={field} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input name={`${tier}-price`} type="number" step="0.01" min="0.01" required={tier === "basic"} placeholder="Price (π)" className={field} />
            <input name={`${tier}-days`} type="number" min="1" required={tier === "basic"} placeholder="Delivery (days)" className={field} />
          </div>
        </fieldset>
      ))}

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Publish gig
      </button>
    </form>
  );
}
