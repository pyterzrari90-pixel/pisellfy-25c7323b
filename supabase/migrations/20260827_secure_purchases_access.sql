-- Ensure RLS is enabled on purchases table
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them cleanly)
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can create purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.purchases;

-- Create RLS policies for purchases

-- Policy: Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create purchases (buyer creates the purchase record)
CREATE POLICY "Users can create purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own purchases (for status updates, etc.)
CREATE POLICY "Users can update their own purchases"
  ON public.purchases
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Sellers should be able to view purchases of their products
-- This requires a join with products table, which we'll handle via a separate policy

-- Policy: Sellers can view purchases of their products
CREATE POLICY "Sellers can view purchases of their products"
  ON public.purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = purchases.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Comment on policies
COMMENT ON POLICY "Users can view their own purchases" ON public.purchases IS
  'Allows buyers to view their own purchase history';

COMMENT ON POLICY "Sellers can view purchases of their products" ON public.purchases IS
  'Allows sellers to view purchases of their products (for order management)';
