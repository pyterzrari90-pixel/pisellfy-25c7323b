import { motion } from "framer-motion";
import { Wallet, Search, ShoppingBag, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Wallet,
      title: "Connect Wallet",
      description: "Link your Pi wallet securely to start buying or selling digital products.",
    },
    {
      icon: Search,
      title: "Browse Products",
      description: "Explore thousands of digital assets from creators worldwide.",
    },
    {
      icon: ShoppingBag,
      title: "Make a Purchase",
      description: "Pay with Pi cryptocurrency instantly and securely.",
    },
    {
      icon: Download,
      title: "Download & Enjoy",
      description: "Get instant access to your purchased digital products.",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get started in minutes and begin trading digital products with Pi
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl glass-gold mb-6 relative">
                <step.icon className="w-10 h-10 text-primary" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-gold text-primary-foreground font-bold flex items-center justify-center text-sm">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
