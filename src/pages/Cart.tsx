import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePiAuth } from "@/hooks/usePiAuth";
import { piErrorMessage, usePiPayment } from "@/hooks/usePiPayment";
import { useCart } from "@/lib/cart/store";
import { listActiveProducts } from "@/lib/products/api";
import type { Product } from "@/lib/products/types";

const Cart = () => {
  const { lines, setQuantity, remove, clear } = useCart();
  const { session, signIn, loading: authLoading } = usePiAuth();
  const { buyAsync } = usePiPayment();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listActiveProducts()
      .then(setCatalog)
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, []);

  const items = lines
    .map((line) => ({ line, product: catalog.find((p) => p.id === line.productId) }))
    .filter((entry): entry is { line: typeof lines[number]; product: Product } =>
      Boolean(entry.product),
    );

  const total = items.reduce((sum, { line, product }) => sum + line.quantity * product.price, 0);

  const payWithPi = async () => {
    setPaying(true);
    setError(null);
    try {
      // Pi allows a single active payment at a time: pay each line sequentially.
      for (const { line, product } of items) {
        await buyAsync({
          id: product.id,
          title: product.title,
          amount: Number((product.price * line.quantity).toFixed(7)),
        });
      }
      clear();
      toast({ title: "Payment complete", description: "Your Pi payment was confirmed." });
    } catch (e) {
      const message = piErrorMessage(e instanceof Error ? e.message : "Payment failed");
      setError(message);
      toast({ title: "Payment failed", description: message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-20 pt-28">
        <h1 className="font-display text-3xl font-bold">
          Your <span className="gradient-text">Cart</span>
        </h1>

        {loading ? (
          <div className="flex items-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading cart...
          </div>
        ) : items.length === 0 ? (
          <div className="glass mt-8 rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button variant="gold" className="mt-4" asChild>
              <Link to="/#marketplace">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map(({ line, product }) => (
                <li key={product.id} className="flex items-center gap-4 p-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${product.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {product.title}
                    </Link>
                    <p className="text-sm gradient-text font-bold">π {product.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(product.id, line.quantity - 1)}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(product.id, line.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove item"
                      onClick={() => remove(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="glass h-fit rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold gradient-text">π {total.toFixed(2)}</span>
              </div>

              {session ? (
                <Button
                  variant="gold"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={paying}
                  onClick={() => void payWithPi()}
                >
                  {paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="font-bold">π</span>
                  )}
                  {paying ? "Processing..." : "Payer avec Pi"}
                </Button>
              ) : (
                <Button
                  variant="gold"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={authLoading}
                  onClick={() => void signIn()}
                >
                  {authLoading ? "Connecting..." : "Se connecter avec Pi"}
                </Button>
              )}

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pi is the only accepted payment method — no card, no PayPal.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
