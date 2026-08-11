import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PI_APP_VERSION, PI_DEVELOPER } from "@/lib/pi/pi-config";
import { useStore } from "@/lib/marketplace/store";

const sections = [
  { to: "/", label: "Marketplace", match: "shop" },
  { to: "/services", label: "Services", match: "services" },
  { to: "/courses", label: "Courses", match: "courses" },
  { to: "/dashboard", label: "Dashboard", match: "dashboard" },
] as const;

const subNav: Record<string, { to: string; label: string }[]> = {
  shop: [
    { to: "/", label: "Shop" },
    { to: "/sell", label: "Sell" },
    { to: "/orders", label: "Orders" },
    { to: "/cart", label: "Cart" },
  ],
  services: [
    { to: "/services", label: "Browse" },
    { to: "/services/orders", label: "My orders" },
    { to: "/services/become", label: "Become a freelancer" },
    { to: "/services/dashboard", label: "Freelancer hub" },
  ],
  dashboard: [
    { to: "/dashboard", label: "Buyer" },
    { to: "/dashboard/seller", label: "Seller" },
    { to: "/dashboard/freelance", label: "Freelance" },
    { to: "/dashboard/instructor", label: "Instructor" },
  ],
  courses: [
    { to: "/courses", label: "Browse" },
    { to: "/courses/my", label: "My learning" },
    { to: "/courses/become", label: "Become an instructor" },
    { to: "/courses/dashboard", label: "Instructor hub" },
  ],
};

function sectionFor(pathname: string): string {
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/courses")) return "courses";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return "shop";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, cartCount, signOut } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = sectionFor(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              π
            </span>
            <span className="text-lg font-semibold tracking-tight">sellfy</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            {sections.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className={`rounded-md px-2.5 py-1.5 transition-colors hover:bg-accent hover:text-foreground ${
                  active === section.match
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-border bg-muted/30">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-xs">
            {(subNav[active] ?? []).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-background text-foreground font-medium" }}
                activeOptions={{ exact: item.to === "/" || item.to === "/services" || item.to === "/courses" }}
              >
                {item.label}
                {item.to === "/cart" && cartCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {user && (
          <div className="border-t border-border bg-muted/40">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
              <span>
                Signed in as <span className="font-medium text-foreground">@{user.username}</span>
              </span>
              <button onClick={signOut} className="underline underline-offset-2 hover:text-foreground">
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-xs text-muted-foreground">
          sellfy v{PI_APP_VERSION} — by {PI_DEVELOPER}. Payments in Pi only, inside the Pi Browser.
        </div>
      </footer>
    </div>
  );
}
