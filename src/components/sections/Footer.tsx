import { motion } from "framer-motion";
import { Twitter, Github, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Marketplace: ["All Products", "Categories", "Featured", "New Arrivals", "Best Sellers"],
    Creators: ["Start Selling", "Creator Dashboard", "Pricing", "Resources", "Success Stories"],
    Company: ["About Us", "Blog", "Careers", "Press Kit", "Contact"],
    Support: ["Help Center", "Community", "Trust & Safety", "Terms of Service", "Privacy Policy"],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: MessageCircle, href: "#", label: "Discord" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Sellfy<span className="text-primary">.pi</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              The premier digital marketplace for Pi Network. Buy and sell digital products with Pi cryptocurrency.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Sellfy.pi. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold gradient-text">Pi Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
