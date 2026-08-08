import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { piAuthenticate } from "@/lib/pi/pi-client";
import { seedProducts, type Product } from "./products";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  paymentId: string;
  txid: string;
  createdAt: string;
  total: number;
  items: { productId: string; name: string; price: number; quantity: number }[];
}

export interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

const LS = {
  user: "sellfy.user",
  cart: "sellfy.cart",
  orders: "sellfy.orders",
  products: "sellfy.products",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface StoreValue {
  hydrated: boolean;
  user: PiUser | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  authError: string | null;
  authPending: boolean;
  products: Product[];
  addProduct: (input: Omit<Product, "id" | "seller">) => void;
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setUser(read<PiUser | null>(LS.user, null));
    setUserProducts(read<Product[]>(LS.products, []));
    setCart(read<CartLine[]>(LS.cart, []));
    setOrders(read<Order[]>(LS.orders, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS.cart, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS.orders, JSON.stringify(orders));
  }, [orders, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS.products, JSON.stringify(userProducts));
  }, [userProducts, hydrated]);

  const products = useMemo(() => [...userProducts, ...seedProducts], [userProducts]);

  const signIn = useCallback(async () => {
    setAuthPending(true);
    setAuthError(null);
    try {
      const result = await piAuthenticate();
      const next: PiUser = {
        uid: result.user.uid,
        username: result.user.username,
        accessToken: result.accessToken,
      };
      setUser(next);
      window.localStorage.setItem(LS.user, JSON.stringify(next));
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Sign-in was cancelled or failed. Please try again in the Pi Browser.",
      );
    } finally {
      setAuthPending(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(LS.user);
  }, []);

  const addProduct = useCallback(
    (input: Omit<Product, "id" | "seller">) => {
      setUserProducts((prev) => [
        {
          ...input,
          id: `u-${Date.now().toString(36)}`,
          seller: user?.username ?? "unknown",
        },
        ...prev,
      ]);
    },
    [user],
  );

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const addOrder = useCallback((order: Order) => setOrders((prev) => [order, ...prev]), []);

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = cart.reduce((sum, l) => {
    const product = products.find((p) => p.id === l.productId);
    return sum + (product ? product.price * l.quantity : 0);
  }, 0);

  const value: StoreValue = {
    hydrated,
    user,
    signIn,
    signOut,
    authError,
    authPending,
    products,
    addProduct,
    cart,
    cartCount,
    cartTotal,
    addToCart,
    setQuantity,
    clearCart,
    orders,
    addOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
