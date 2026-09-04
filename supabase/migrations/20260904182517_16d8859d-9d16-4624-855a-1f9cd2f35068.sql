-- 1. Seller level enum
CREATE TYPE public.seller_level AS ENUM ('new', 'level_1', 'level_2', 'top_rated');

-- 2. Buyer/seller role flag on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_seller boolean NOT NULL DEFAULT false;

-- 3. Seller profiles table
CREATE TABLE public.seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  level public.seller_level NOT NULL DEFAULT 'new',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  sales_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX seller_profiles_user_id_idx ON public.seller_profiles(user_id);
CREATE INDEX seller_profiles_level_idx ON public.seller_profiles(level);

-- 4. Grants
GRANT SELECT ON public.seller_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.seller_profiles TO authenticated;
GRANT ALL ON public.seller_profiles TO service_role;

-- 5. RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active seller profiles"
  ON public.seller_profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can view their own seller profile"
  ON public.seller_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own seller profile"
  ON public.seller_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile"
  ON public.seller_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Protect reputation fields from client-side edits
CREATE OR REPLACE FUNCTION public.protect_seller_reputation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  NEW.level := OLD.level;
  NEW.rating := OLD.rating;
  NEW.reviews_count := OLD.reviews_count;
  NEW.sales_count := OLD.sales_count;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER seller_profiles_protect_reputation
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_seller_reputation();

-- 7. updated_at trigger
CREATE TRIGGER seller_profiles_set_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Keep profiles.is_seller in sync automatically
CREATE OR REPLACE FUNCTION public.sync_profile_is_seller()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET is_seller = true, updated_at = now()
  WHERE id = NEW.user_id AND is_seller = false;
  RETURN NEW;
END;
$$;

CREATE TRIGGER seller_profiles_sync_flag
  AFTER INSERT ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_is_seller();