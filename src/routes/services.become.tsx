import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useFreelance } from "@/lib/freelance/store";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/services/become")({
  head: () => ({
    meta: [
      { title: "Become a freelancer — sellfy" },
      { name: "description", content: "Create your freelancer profile on sellfy and get paid in Pi." },
      { property: "og:title", content: "Become a freelancer on sellfy" },
      { property: "og:description", content: "Create your profile, publish gigs, get paid in Pi." },
    ],
  }),
  component: BecomeFreelancer,
});

const field =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function BecomeFreelancer() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Become a freelancer</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your Pi account is your identity — no extra sign-up.
      </p>
      <div className="mt-4">
        <PiSignInGate>
          <ProfileForm />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function ProfileForm() {
  const { user } = useStore();
  const { saveProfile, getProfile } = useFreelance();
  const navigate = useNavigate();
  const existing = user ? getProfile(user.uid) : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    saveProfile({
      uid: user.uid,
      username: user.username,
      avatar:
        String(form.get("avatar") ?? "").trim() ||
        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`,
      title: String(form.get("title") ?? "").trim().slice(0, 80),
      bio: String(form.get("bio") ?? "").trim().slice(0, 800),
      skills: String(form.get("skills") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      languages: String(form.get("languages") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    });
    void navigate({ to: "/services/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="avatar" className="text-sm font-medium">
          Photo URL
        </label>
        <input id="avatar" name="avatar" type="url" defaultValue={existing?.avatar} placeholder="https://…" className={field} />
      </div>
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Professional title
        </label>
        <input id="title" name="title" required maxLength={80} defaultValue={existing?.title} placeholder="Brand designer & illustrator" className={field} />
      </div>
      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea id="bio" name="bio" required rows={4} maxLength={800} defaultValue={existing?.bio} className={field} />
      </div>
      <div>
        <label htmlFor="skills" className="text-sm font-medium">
          Skills (comma separated)
        </label>
        <input id="skills" name="skills" required maxLength={200} defaultValue={existing?.skills.join(", ")} placeholder="Logo design, Figma, Illustration" className={field} />
      </div>
      <div>
        <label htmlFor="languages" className="text-sm font-medium">
          Languages spoken (comma separated)
        </label>
        <input id="languages" name="languages" required maxLength={200} defaultValue={existing?.languages.join(", ")} placeholder="English, French" className={field} />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {existing ? "Update profile" : "Create freelancer profile"}
      </button>
    </form>
  );
}
