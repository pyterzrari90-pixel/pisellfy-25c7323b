import { motion } from "framer-motion";
import { Code, Palette, Music, Video, BookOpen, Gamepad2, Camera, FileText } from "lucide-react";

const Categories = () => {
  const categories = [
    { icon: Code, name: "Templates", count: "2,450", gradient: "from-blue-500 to-cyan-400" },
    { icon: Palette, name: "Design Assets", count: "8,320", gradient: "from-purple-500 to-pink-400" },
    { icon: Music, name: "Audio & Music", count: "1,890", gradient: "from-green-500 to-emerald-400" },
    { icon: Video, name: "Video Content", count: "3,120", gradient: "from-red-500 to-orange-400" },
    { icon: BookOpen, name: "E-Books", count: "5,670", gradient: "from-amber-500 to-yellow-400" },
    { icon: Gamepad2, name: "Games & Apps", count: "980", gradient: "from-indigo-500 to-violet-400" },
    { icon: Camera, name: "Photography", count: "4,210", gradient: "from-pink-500 to-rose-400" },
    { icon: FileText, name: "Documents", count: "2,150", gradient: "from-teal-500 to-cyan-400" },
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
    <section id="categories" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Browse <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore thousands of digital products across various categories
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories.map((category, index) => (
            <motion.a
              key={index}
              href="#"
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>

                {/* Name */}
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>

                {/* Count */}
                <p className="text-sm text-muted-foreground">
                  {category.count} products
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
