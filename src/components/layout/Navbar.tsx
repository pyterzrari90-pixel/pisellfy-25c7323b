import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Menu, X, Wallet, Loader2, LogOut, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePiAuth } from "@/hooks/usePiAuth";
import { usePoints } from "@/hooks/usePoints";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount] = useState(2);
  const { session, piUsername, loading, signIn, signOut } = usePiAuth();
  const { balance } = usePoints();


  const navLinks = [
    { name: "Marketplace", href: "/#marketplace" },
    { name: "Abonnements", href: "/subscriptions" },
    { name: "Categories", href: "/#categories" },
    { name: "Creators", href: "/#creators" },
    { name: "About", href: "/#about" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Sellfy<span className="text-primary">.pi</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search digital products..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Points Badge */}
            {session && (
              <Link to="/rewards" className="hidden sm:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-sm font-medium hover:bg-primary/10"
                >
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="gradient-text font-bold">{balance}</span>
                  <span className="text-muted-foreground text-xs">pts</span>
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-gold text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Connect Wallet / Pi Auth Button */}
            {session ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">@{piUsername ?? "pioneer"}</span>
                <Button variant="outline" size="default" onClick={() => void signOut()}>
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                variant="gold"
                size="default"
                className="hidden sm:flex"
                disabled={loading}
                onClick={() => void signIn()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                {loading ? "Connecting..." : "Connect Pi"}
              </Button>
            )}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Mobile Links */}
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-2 text-foreground font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              {session ? (
                <Button variant="outline" size="lg" className="w-full" onClick={() => void signOut()}>
                  <LogOut className="w-4 h-4" />
                  Sign out @{piUsername ?? "pioneer"}
                </Button>
              ) : (
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  onClick={() => void signIn()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {loading ? "Connecting..." : "Connect Pi Wallet"}
                </Button>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
