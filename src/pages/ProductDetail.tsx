import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, ShoppingCart, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { usePiAuth } from "@/hooks/usePiAuth";
import { usePiPayment } from "@/hooks/usePiPayment";
import { useCart } from "@/lib/cart/store";
import { getProduct } from "@/lib/products/api";
import type { Product } from "@/lib/products/types";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { session, signIn, loading: authLoading } = usePiAuth();
  const { buy, pendingProductId } = usePiPayment();
  const { add } = useCart();

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    getProduct(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center gap-2 py-40 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-40 text-center">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Button variant="gold" className="mt-6" asChild>
            <Link to="/">Back to marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const paying = pendingProductId === product.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-20 pt-28">
        <div className="grid gap-10 lg:grid-cols-2">
          <img
            src={product.image_url}
            alt={product.title}
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
          />

          <div>
            <span className="glass rounded-full px-3 py-1 text-xs font-medium">
              {product.category}
            </span>
            <h1 className="font-display mt-4 text-3xl font-bold">{product.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">by {product.creator_name}</p>

            {product.reviews_count > 0 && (
              <div className="mt-3 flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews_count} reviews)
                </span>
              </div>
            )}

            <p className="mt-6 text-3xl font-bold gradient-text">π {product.price}</p>
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {session ? (
              <div className="mt-8 space-y-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={paying}
                  onClick={() =>
                    void buy({ id: product.id, title: product.title, amount: product.price })
                  }
                >
                  {paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="font-bold">π</span>
                  )}
                  {paying ? "Processing..." : "Payer avec Pi"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    add(product.id);
                    setAdded(true);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {added ? "Added to cart" : "Add to cart"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Pi is the only accepted payment method.
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Sign in with Pi to buy this product.
                </p>
                <Button
                  variant="gold"
                  size="lg"
                  className="mt-4 w-full"
                  disabled={authLoading}
                  onClick={() => void signIn()}
                >
                  {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {authLoading ? "Connecting..." : "Se connecter avec Pi"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
