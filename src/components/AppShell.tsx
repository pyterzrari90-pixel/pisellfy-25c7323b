import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PI_APP_VERSION, PI_DEVELOPER } from "@/lib/pi/pi-config";
import { useStore } from "@/lib/marketplace/store";

const navItems = [
  { to: "/", label: "Shop" },
  { to: "/sell", label: "Sell" },
  { to: "/orders", label: "Orders" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, cartCount, signOut } = useStore();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              π
            </span>
            <span className="text-lg font-semibold tracking-tight">sellfy</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/cart"
              className="relative rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
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
