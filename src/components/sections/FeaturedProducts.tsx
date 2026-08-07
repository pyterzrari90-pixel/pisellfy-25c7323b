import { motion } from "framer-motion";
import { Heart, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePiPayment } from "@/hooks/usePiPayment";

const FeaturedProducts = () => {
  const { buy, pendingProductId } = usePiPayment();

  const products = [
    {
      id: 1,
      title: "Premium UI Kit",
      creator: "DesignStudio",
      amount: 25,
      price: "π 25",
      originalPrice: "π 50",
      rating: 4.9,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
      category: "Design",
      featured: true,
    },
    {
      id: 2,
      title: "React Dashboard Template",
      creator: "CodeMaster",
      amount: 35,
      price: "π 35",
      originalPrice: null,
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      category: "Templates",
      featured: false,
    },
    {
      id: 3,
      title: "Ambient Music Pack",
      creator: "SoundWave",
      amount: 15,
      price: "π 15",
      originalPrice: "π 30",
      rating: 4.7,
      reviews: 56,
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
      category: "Audio",
      featured: true,
    },
    {
      id: 4,
      title: "Crypto Trading Guide",
      creator: "TradePro",
      amount: 45,
      price: "π 45",
      originalPrice: null,
      rating: 4.9,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
      category: "E-Books",
      featured: false,
    },
    {
      id: 5,
      title: "3D Icon Collection",
      creator: "IconArtist",
      amount: 20,
      price: "π 20",
      originalPrice: null,
      rating: 4.6,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
      category: "Design",
      featured: false,
    },
    {
      id: 6,
      title: "Video Editing Course",
      creator: "FilmGuru",
      amount: 60,
      price: "π 60",
      originalPrice: "π 100",
      rating: 4.8,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
      category: "Courses",
      featured: true,
    },
  ];


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
              Handpicked digital products from top creators
            </p>
          </div>
          <Button variant="gold-outline" className="mt-4 sm:mt-0">
            View All Products
          </Button>
        </motion.div>

        {/* Products Grid */}
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
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.featured && (
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
                    disabled={pendingProductId === String(product.id)}
                    onClick={() =>
                      void buy({ id: product.id, title: product.title, amount: product.amount })
                    }
                  >
                    {pendingProductId === String(product.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="font-bold">π</span>
                    )}
                    {pendingProductId === String(product.id)
                      ? "Processing..."
                      : `Buy for ${product.price}`}
                  </Button>
                </div>

              </div>

              {/* Content */}
              <div className="p-5">
                {/* Creator */}
                <p className="text-sm text-muted-foreground mb-1">
                  by {product.creator}
                </p>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {product.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold gradient-text">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
