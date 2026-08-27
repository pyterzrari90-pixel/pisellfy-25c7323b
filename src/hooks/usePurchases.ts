import { useCallback, useEffect, useState } from "react";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import {
  listMyPurchases,
  getPurchase,
  listSalesForSeller,
  type Purchase,
} from "@/lib/purchases/api";

/**
 * Hook to fetch purchases made by the current user (buyer perspective).
 */
export const useMyPurchases = () => {
  const { session } = usePiAuth();
  const userId = session?.user?.id ?? null;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPurchases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setPurchases(await listMyPurchases(userId));
    } catch (e) {
      toast({
        title: "Chargement impossible",
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

  return { purchases, loading, refresh };
};

/**
 * Hook to fetch a single purchase with ownership check.
 */
export const usePurchase = (purchaseId: string | null) => {
  const { session } = usePiAuth();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    if (!purchaseId) {
      setPurchase(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getPurchase(purchaseId)
      .then((p) => {
        if (!p) {
          setNotAuthorized(true);
        } else {
          setPurchase(p);
          setNotAuthorized(false);
        }
      })
      .catch((e) => {
        toast({
          title: "Chargement impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
        setNotAuthorized(true);
      })
      .finally(() => setLoading(false));
  }, [purchaseId]);

  return { purchase, loading, notAuthorized };
};

/**
 * Hook to fetch sales for the current seller.
 */
export const useMySales = () => {
  const { session } = usePiAuth();
  const sellerId = session?.user?.id ?? null;
  const [sales, setSales] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!sellerId) {
      setSales([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setSales(await listSalesForSeller(sellerId));
    } catch (e) {
      toast({
        title: "Chargement impossible",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { sales, loading, refresh };
};
