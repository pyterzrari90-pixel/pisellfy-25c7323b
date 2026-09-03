import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PiAuthProvider } from "@/hooks/usePiAuth";
import { CartProvider } from "@/lib/cart/store";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Subscriptions from "./pages/Subscriptions";
import CreateSubscription from "./pages/CreateSubscription";
import MySubscriptions from "./pages/MySubscriptions";
import SellerSubscriptions from "./pages/SellerSubscriptions";
import CreateProduct from "./pages/CreateProduct";
import SellerProducts from "./pages/SellerProducts";
import EditProduct from "./pages/EditProduct";
import Rewards from "./pages/Rewards";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PiAuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/subscriptions/create" element={<CreateSubscription />} />
              <Route path="/subscriptions/mine" element={<MySubscriptions />} />
              <Route path="/subscriptions/dashboard" element={<SellerSubscriptions />} />
              <Route path="/products/create" element={<CreateProduct />} />
              <Route path="/products/dashboard" element={<SellerProducts />} />
              <Route path="/products/edit/:productId" element={<EditProduct />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </PiAuthProvider>
  </QueryClientProvider>
);

export default App;
