import { motion } from "framer-motion";
import { Heart, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePiPayment } from "@/hooks/usePiPayment";
import { useProductCatalog } from "@/hooks/useProducts";

const FeaturedProducts = () => {
  const { buy, pendingProductId } = usePiPayment();
  const { products, loading } = useProductCatalog();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="marketplace" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
        >
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Featured <span className="gradient-text">Products</span>
            </h2>
            <p className="text-muted-foreground">
              Digital products from creators in the Pi Network
            </p>
          </div>
          <Button variant="gold-outline" className="mt-4 sm:mt-0" asChild>
            <Link to="/products/create">Create Your Product</Link>
          </Button>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground justify-center py-12">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="glass rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">
              No products available yet. Be the first to sell on Pi Network!
            </p>
            <Button variant="gold" className="mt-4" asChild>
              <Link to="/products/create">Create First Product</Link>
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.is_featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold gradient-gold text-primary-foreground">
                        Featured
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-medium glass">
                      {product.category}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-destructive/20">
                    <Heart className="w-4 h-4 text-foreground" />
                  </button>

                  {/* Buy with Pi */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="gold"
                      size="sm"
                      className="w-full"
                      disabled={pendingProductId === product.id}
                      onClick={() =>
                        void buy({
                          id: product.id,
                          title: product.title,
                          amount: product.price,
                        })
                      }
                    >
                      {pendingProductId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="font-bold">π</span>
                      )}
                      {pendingProductId === product.id
                        ? "Processing..."
                        : `Buy for π ${product.price}`}
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Creator */}
                  <p className="text-sm text-muted-foreground mb-1">
                    by {product.creator_name}
                  </p>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  {product.reviews_count > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold gradient-text">
                      π {product.price}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        π {product.original_price}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
