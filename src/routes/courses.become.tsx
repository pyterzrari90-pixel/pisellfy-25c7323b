import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useCourses } from "@/lib/courses/store";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/courses/become")({
  head: () => ({
    meta: [
      { title: "Become an instructor — sellfy Courses" },
      { name: "description", content: "Create your instructor profile on sellfy and sell courses priced in Pi." },
      { property: "og:title", content: "Become an instructor on sellfy" },
      { property: "og:description", content: "Publish courses and earn in Pi." },
    ],
  }),
  component: BecomeInstructor,
});

const field =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function BecomeInstructor() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Become an instructor</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Signed in with Pi — that account is your instructor identity.
      </p>
      <div className="mt-4">
        <PiSignInGate>
          <InstructorForm />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function InstructorForm() {
  const { user } = useStore();
  const { saveInstructor, getInstructor } = useCourses();
  const navigate = useNavigate();
  const existing = user ? getInstructor(user.uid) : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    saveInstructor({
      uid: user.uid,
      username: user.username,
      avatar:
        String(form.get("avatar") ?? "").trim() ||
        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`,
      headline: String(form.get("headline") ?? "").trim().slice(0, 80),
      bio: String(form.get("bio") ?? "").trim().slice(0, 800),
      expertise: String(form.get("expertise") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    });
    void navigate({ to: "/courses/dashboard" });
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
        <label htmlFor="headline" className="text-sm font-medium">
          Headline
        </label>
        <input id="headline" name="headline" required maxLength={80} defaultValue={existing?.headline} placeholder="Senior engineer & educator" className={field} />
      </div>
      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea id="bio" name="bio" required rows={4} maxLength={800} defaultValue={existing?.bio} className={field} />
      </div>
      <div>
        <label htmlFor="expertise" className="text-sm font-medium">
          Areas of expertise (comma separated)
        </label>
        <input id="expertise" name="expertise" required maxLength={200} defaultValue={existing?.expertise.join(", ")} placeholder="React, Pi SDK, UX" className={field} />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {existing ? "Update profile" : "Create instructor profile"}
      </button>
    </form>
  );
}
