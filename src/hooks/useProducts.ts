import { useCallback, useEffect, useState } from "react";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import {
  listActiveProducts,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} from "@/lib/products/api";
import type { Product, ProductInput } from "@/lib/products/types";

/**
 * Hook to fetch all active products for the marketplace catalog.
 */
export const useProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActiveProducts()
      .then(setProducts)
      .catch((e) =>
        toast({
          title: "Chargement impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
};

/**
 * Hook to manage products created by the current seller.
 */
export const useMyProducts = () => {
  const { session, signIn } = usePiAuth();
  const userId = session?.user?.id ?? null;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProducts(await listMyProducts(userId));
    } catch (e) {
      toast({
        title: "Chargement des produits impossible",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: ProductInput) => {
      if (!userId) {
        await signIn();
        return null;
      }
      try {
        const product = await createProduct(userId, input);
        toast({
          title: "Produit créé",
          description: `« ${product.title} » est maintenant en ligne.`,
        });

        // Award points for product creation
        const { onProductCreated } = await import("@/lib/points/integration");
        await onProductCreated(userId, product.title);

        await refresh();
        return product;
      } catch (e) {
        toast({
          title: "Création impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
        return null;
      }
    },
    [userId, signIn, refresh]
  );

  const update = useCallback(
    async (productId: string, updates: Partial<ProductInput>) => {
      try {
        const product = await updateProduct(productId, updates);
        toast({ title: "Produit mis à jour", description: `« ${product.title} » modifié.` });
        await refresh();
        return product;
      } catch (e) {
        toast({
          title: "Mise à jour impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
        return null;
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (productId: string) => {
      try {
        await deleteProduct(productId);
        toast({ title: "Produit supprimé", description: "Le produit a été retiré." });
        await refresh();
        return true;
      } catch (e) {
        toast({
          title: "Suppression impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
        return false;
      }
    },
    [refresh]
  );

  return {
    products,
    loading,
    create,
    update,
    remove,
    refresh,
    isSignedIn: Boolean(userId),
  };
};

/**
 * Hook to fetch a single product by ID.
 */
export const useProduct = (productId: string | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getProduct(productId)
      .then(setProduct)
      .catch((e) =>
        toast({
          title: "Chargement impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [productId]);

  return { product, loading };
};
