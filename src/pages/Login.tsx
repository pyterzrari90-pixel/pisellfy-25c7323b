import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { usePiAuth } from "@/hooks/usePiAuth";

/** Pi Sign-In is the ONLY authentication method — no email, Google or Facebook. */
const Login = () => {
  const { session, loading, error, signIn } = usePiAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass w-full max-w-md rounded-2xl border border-border p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold">
            <span className="text-2xl font-bold text-primary-foreground">π</span>
          </div>
          <h1 className="font-display mt-6 text-2xl font-bold">
            Sign in to <span className="gradient-text">Sellfy.pi</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sellfy.pi uses Pi Sign-In only. Open the app in the Pi Browser to continue.
          </p>

          <Button
            variant="gold"
            size="lg"
            className="mt-8 w-full"
            disabled={loading}
            onClick={() => void signIn()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {loading ? "Connecting..." : "Se connecter avec Pi"}
          </Button>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <p className="mt-6 text-xs text-muted-foreground">
            Payments on Sellfy.pi are made in Pi only.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
