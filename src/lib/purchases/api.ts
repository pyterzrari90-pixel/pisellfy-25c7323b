// Data access for purchases with proper ownership checks
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

export type Purchase = Tables<"purchases">;

type PurchaseWithProduct = Purchase & {
  product?: {
    seller_id?: string | null;
  } | null;
};

/**
 * List purchases made by the current user (buyer perspective).
 * RLS policy ensures only the user's own purchases are returned.
 */
export async function listMyPurchases(userId: string): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error("Impossible de charger vos achats.");
  }
  return data;
}

/**
 * Get a single purchase by ID.
 * RLS policy ensures only the buyer or seller can access it.
 */
export async function getPurchase(purchaseId: string): Promise<Purchase | null> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", purchaseId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found or no access
    throw new Error("Impossible de charger cet achat.");
  }
  return data;
}

/**
 * List purchases for products sold by the current user (seller perspective).
 * RLS policy ensures only purchases of seller's products are returned.
 */
export async function listSalesForSeller(sellerId: string): Promise<Purchase[]> {
  // This query joins with products to filter by seller_id
  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      product:products!inner(seller_id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger vos ventes.");
  }

  // Filter to only include purchases of seller's products
  // (RLS will handle this, but we double-check for clarity)
  const sellerPurchases = ((data ?? []) as PurchaseWithProduct[]).filter(
    (item) => item.product?.seller_id === sellerId
  );

  return sellerPurchases.map((item) => {
    const { product, ...purchase } = item;
    return purchase;
  });
}

/**
 * Create a purchase record.
 * RLS policy ensures user_id matches the authenticated user.
 */
export async function createPurchase(purchase: {
  user_id: string;
  product_id: string;
  product_title: string;
  amount: number;
  memo: string;
  payment_id: string;
  txid?: string;
  metadata?: Json;
}): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .insert({
      ...purchase,
      status: "completed",
      txid: purchase.txid || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Impossible d'enregistrer l'achat.");
  }
  return data;
}

/**
 * Update purchase status.
 * RLS policy ensures only the buyer can update their purchase.
 */
export async function updatePurchaseStatus(
  purchaseId: string,
  status: string
): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .update({ status })
    .eq("id", purchaseId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Achat non trouvé ou vous n'êtes pas autorisé à le modifier.");
    }
    throw new Error("Impossible de mettre à jour le statut de l'achat.");
  }
  return data;
}
