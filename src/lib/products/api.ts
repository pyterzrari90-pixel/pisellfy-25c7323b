// Data access for the Products module.
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductInput } from "./types";

const asProduct = (row: Record<string, unknown>): Product => ({
  ...(row as unknown as Product),
  price: Number(row.price),
  original_price: row.original_price ? Number(row.original_price) : null,
  rating: Number(row.rating) || 0,
  reviews_count: Number(row.reviews_count) || 0,
});

/**
 * List all active products for the marketplace catalog.
 */
export async function listActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(asProduct);
}

/**
 * List products created by a specific seller.
 */
export async function listMyProducts(sellerId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(asProduct);
}

/**
 * Get a single product by ID.
 */
export async function getProduct(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return asProduct(data);
}

/**
 * Create a new product.
 */
export async function createProduct(
  sellerId: string,
  input: ProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...input,
      seller_id: sellerId,
      rating: 0,
      reviews_count: 0,
      is_active: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return asProduct(data);
}

/**
 * Update an existing product.
 * RLS policy ensures only the seller can update their own products.
 */
export async function updateProduct(
  productId: string,
  updates: Partial<ProductInput>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select("*")
    .single();
  if (error) {
    // RLS violation or not found
    if (error.code === "PGRST116") {
      throw new Error("Produit non trouvé ou vous n'êtes pas autorisé à le modifier.");
    }
    throw error;
  }
  return asProduct(data);
}

/**
 * Delete a product (soft delete by setting is_active = false).
 * RLS policy ensures only the seller can delete their own products.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);
  if (error) {
    throw new Error("Impossible de supprimer ce produit. Vous n'êtes peut-être pas le propriétaire.");
  }
}

/**
 * Permanently delete a product from the database.
 */
export async function permanentlyDeleteProduct(
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}
