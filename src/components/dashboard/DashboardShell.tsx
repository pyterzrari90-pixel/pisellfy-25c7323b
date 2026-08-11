import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Briefcase, GraduationCap, ShieldCheck, ShoppingBag, Store } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { isAdmin } from "@/lib/admin";
import { useCourses } from "@/lib/courses/store";
import { useFreelance } from "@/lib/freelance/store";
import { useStore } from "@/lib/marketplace/store";

const tabs = [
  { to: "/dashboard", label: "Buyer", icon: ShoppingBag, exact: true, role: "buyer" },
  { to: "/dashboard/seller", label: "Seller", icon: Store, exact: false, role: "seller" },
  { to: "/dashboard/freelance", label: "Freelance", icon: Briefcase, exact: false, role: "freelance" },
  { to: "/dashboard/instructor", label: "Instructor", icon: GraduationCap, exact: false, role: "instructor" },
  { to: "/dashboard/admin", label: "Admin", icon: ShieldCheck, exact: false, role: "admin" },
] as const;

/** Roles the signed-in user actually has (buyer is always available). */
function useRoles(): Set<string> {
  const { user, products } = useStore();
  const { gigs, getProfile } = useFreelance();
  const { courses, getInstructor } = useCourses();
  const roles = new Set<string>(["buyer"]);
  if (!user) return roles;
  if (products.some((p) => p.seller === user.username)) roles.add("seller");
  if (getProfile(user.uid) || gigs.some((g) => g.freelancerUid === user.uid)) roles.add("freelance");
  if (getInstructor(user.uid) || courses.some((c) => c.instructorUid === user.uid))
    roles.add("instructor");
  if (isAdmin(user)) roles.add("admin");
  return roles;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <PiSignInGate>
        <Tabs />
        <div className="mt-5 space-y-6 pb-4">{children}</div>
      </PiSignInGate>
    </AppShell>
  );
}

function Tabs() {
  const roles = useRoles();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
        const owned = roles.has(tab.role);
        if (tab.role === "admin" && !owned) return null;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
              active
                ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {!owned && !active && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                new
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
