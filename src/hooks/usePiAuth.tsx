import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authenticateWithPi } from "@/lib/pi";

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

  const signIn = useCallback(async () => {
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
    } catch (e) {
      const message = e instanceof Error ? e.message : "Pi authentication failed";
      setError(message);
      console.error("Pi authentication failed:", message);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPiUsername(null);
  }, []);

  // Automatically trigger Pi authentication on app load.
  useEffect(() => {
    if (loading || session || autoTried.current) return;
    autoTried.current = true;
    void signIn();
  }, [loading, session, signIn]);

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
