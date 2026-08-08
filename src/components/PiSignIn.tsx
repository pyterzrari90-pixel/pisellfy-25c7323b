import { useStore } from "@/lib/marketplace/store";

export function PiSignInGate({ children }: { children: React.ReactNode }) {
  const { hydrated, user } = useStore();
  if (!hydrated) return null;
  if (user) return <>{children}</>;
  return <PiSignInCard />;
}

export function PiSignInCard() {
  const { signIn, authPending, authError } = useStore();
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
        π
      </span>
      <h2 className="mt-4 text-lg font-semibold">Sign in with Pi</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        sellfy uses Pi Sign-In only. Open the app in the Pi Browser to continue.
      </p>
      <button
        onClick={() => void signIn()}
        disabled={authPending}
        className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {authPending ? "Connecting…" : "Se connecter avec Pi"}
      </button>
      {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}
    </div>
  );
}
