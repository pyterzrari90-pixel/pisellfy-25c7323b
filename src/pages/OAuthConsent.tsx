import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePiAuth } from "@/hooks/usePiAuth";
import { Button } from "@/components/ui/button";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const { session, loading, signIn, piUsername } = usePiAuth();
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      if (!session) return;
      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, session]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: decideError } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-lg">
        {error ? (
          <>
            <h1 className="text-xl font-semibold mb-2">Authorization unavailable</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !session ? (
          <>
            <h1 className="text-xl font-semibold mb-2">Sign in to continue</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Connect your Pi Network account to approve this connection request.
            </p>
            <Button className="w-full" disabled={loading} onClick={() => void signIn()}>
              {loading ? "Connecting…" : "Connect with Pi"}
            </Button>
          </>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-2">
              Connect {details.client?.name ?? "an app"} to your account
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              This lets {details.client?.name ?? "the client"} use Sellfy.pi as
              {piUsername ? ` @${piUsername}` : " you"}, including reading your profile and purchases.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={busy} onClick={() => void decide(true)}>
                Approve
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={busy}
                onClick={() => void decide(false)}
              >
                Deny
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
