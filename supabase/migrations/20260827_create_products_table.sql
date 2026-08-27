-- Create products table for the marketplace
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price IS NULL OR original_price >= 0),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  creator_name TEXT NOT NULL DEFAULT 'Anonymous',
  rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries on active products
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = TRUE;

-- Create index for seller's products
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = TRUE);

-- Sellers can view their own products (including inactive)
CREATE POLICY "Sellers can view their own products"
  ON public.products
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can create products
CREATE POLICY "Sellers can create products"
  ON public.products
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products"
  ON public.products
  FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete their own products"
  ON public.products
  FOR DELETE
  USING (auth.uid() = seller_id);

-- Comment on table
COMMENT ON TABLE public.products IS 'Marketplace products - digital goods sold for Pi';
COMMENT ON COLUMN public.products.seller_id IS 'Reference to the seller profile';
COMMENT ON COLUMN public.products.price IS 'Current price in Pi';
COMMENT ON COLUMN public.products.original_price IS 'Original price for showing discounts (optional)';
COMMENT ON COLUMN public.products.is_featured IS 'Whether product is featured on homepage';
COMMENT ON COLUMN public.products.is_active IS 'Soft delete flag - inactive products are hidden from catalog';
