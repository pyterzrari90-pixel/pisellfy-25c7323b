import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authenticateWithPi } from "@/lib/pi";
import { redirectAfterAuth } from "@/lib/piConfig";
import { toast } from "@/hooks/use-toast";

interface PiAuthContextValue {
  session: Session | null;
  user: User | null;
  piUsername: string | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextValue | undefined>(undefined);

export const PiAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [piUsername, setPiUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoTried = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      const name = nextSession?.user?.user_metadata?.pi_username;
      if (typeof name === "string") setPiUsername(name);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      const name = data.session?.user?.user_metadata?.pi_username;
      if (typeof name === "string") setPiUsername(name);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const runSignIn = useCallback(async (silent: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const auth = await authenticateWithPi();

      const { data, error: fnError } = await supabase.functions.invoke("pi-auth", {
        body: { accessToken: auth.accessToken },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.token_hash || !data?.email) throw new Error("Backend did not return a session");

      const { error: otpError } = await supabase.auth.verifyOtp({
        email: data.email,
        token_hash: data.token_hash,
        type: "email",
      });
      if (otpError) throw otpError;

      setPiUsername(data.pi_username ?? auth.user?.username ?? null);
      if (!silent) {
        toast({
          title: "Signed in with Pi",
          description: `Welcome @${data.pi_username ?? auth.user?.username ?? "pioneer"}`,
        });
      }
      // Send the pioneer to the configured Pi redirect URI (no-op if already there).
      redirectAfterAuth();
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Pi authentication failed";
      const cancelled = /cancel|denied|abort|closed/i.test(raw);
      const message = cancelled
        ? "Pi sign-in was cancelled."
        : /Pi SDK|Pi Browser/i.test(raw)
          ? "Open this app in the Pi Browser to sign in with Pi."
          : raw;
      setError(message);
      console.error("Pi authentication failed:", raw);
      if (!silent) {
        toast({
          title: cancelled ? "Sign-in cancelled" : "Pi sign-in failed",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(() => runSignIn(false), [runSignIn]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPiUsername(null);
  }, []);

  // Automatically trigger Pi authentication on app load (silent: no toast noise).
  useEffect(() => {
    if (loading || session || autoTried.current) return;
    autoTried.current = true;
    void runSignIn(true);
  }, [loading, session, runSignIn]);

  return (
    <PiAuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        piUsername,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => {
  const ctx = useContext(PiAuthContext);
  if (!ctx) throw new Error("usePiAuth must be used within a PiAuthProvider");
  return ctx;
};
