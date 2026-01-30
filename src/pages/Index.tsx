import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import HowItWorks from "@/components/sections/HowItWorks";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
