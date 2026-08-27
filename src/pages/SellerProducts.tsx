import { Link } from "react-router-dom";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { useMyProducts } from "@/hooks/useProducts";
import { usePiAuth } from "@/hooks/usePiAuth";

const SellerProducts = () => {
  const { session, signIn } = usePiAuth();
  const { products, loading, remove, update } = useMyProducts();

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Tableau de bord vendeur
            </h1>
            <p className="text-muted-foreground mt-4">
              Connectez-vous avec Pi pour gérer vos produits.
            </p>
            <Button variant="gold" className="mt-6" onClick={() => void signIn()}>
              Se connecter avec Pi
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-6xl">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Mes produits
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez votre catalogue de produits numériques
              </p>
            </div>
            <Button variant="gold" asChild>
              <Link to="/products/create">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau produit
              </Link>
            </Button>
          </header>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
            </div>
          ) : products.length === 0 ? (
            <div className="glass rounded-2xl border border-border p-8 text-center">
              <p className="text-muted-foreground">
                Vous n'avez pas encore créé de produits.
              </p>
              <Button variant="gold" className="mt-4" asChild>
                <Link to="/products/create">Créer mon premier produit</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="glass rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-4"
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.creator_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold gradient-text">π {product.price}</p>
                        {product.original_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            π {product.original_price}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.is_active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {product.is_active ? "Actif" : "Inactif"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.rating.toFixed(1)} ★ ({product.reviews_count} avis)
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void update(product.id, { is_active: !product.is_active })
                      }
                      title={product.is_active ? "Masquer" : "Publier"}
                    >
                      {product.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/products/edit/${product.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void remove(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerProducts;
