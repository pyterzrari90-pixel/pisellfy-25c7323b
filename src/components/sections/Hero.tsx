import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Creators" },
    { icon: TrendingUp, value: "50K+", label: "Products" },
    { icon: Sparkles, value: "π 1M+", label: "Volume" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Pi Network Ecosystem
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            The Premier{" "}
            <span className="gradient-text">Digital Marketplace</span>
            <br />
            for Pi Network
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Buy and sell digital products with Pi. Templates, courses, assets,
            and more from creators worldwide.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="gold" size="xl">
              Explore Marketplace
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="gold-outline" size="xl">
              Start Selling
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-1/3 hidden lg:block"
        >
          <div className="w-16 h-16 rounded-2xl glass-gold flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-10 top-1/2 hidden lg:block"
        >
          <div className="w-20 h-20 rounded-2xl glass-gold flex items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-20 bottom-1/4 hidden lg:block"
        >
          <div className="w-14 h-14 rounded-2xl glass-gold flex items-center justify-center">
            <span className="text-xl">🎵</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
