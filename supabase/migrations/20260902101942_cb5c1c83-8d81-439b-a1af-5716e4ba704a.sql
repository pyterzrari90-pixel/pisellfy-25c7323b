-- helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pi_uid TEXT NOT NULL UNIQUE,
  pi_username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price IS NULL OR original_price >= 0),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  creator_name TEXT NOT NULL DEFAULT 'Anonymous',
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_seller ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Sellers can view their own products" ON public.products FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can create products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- purchases
CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  payment_id text NOT NULL UNIQUE,
  product_id text NOT NULL,
  product_title text NOT NULL,
  amount numeric NOT NULL,
  memo text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  txid text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases" ON public.purchases FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can view purchases of their products" ON public.purchases FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id::text = purchases.product_id AND p.seller_id = auth.uid())
);
CREATE TRIGGER purchases_set_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX purchases_user_id_idx ON public.purchases (user_id);

-- subscriptions
CREATE TYPE public.billing_interval AS ENUM ('weekly','monthly','yearly');
CREATE TYPE public.subscription_status AS ENUM ('active','past_due','canceled','expired','pending');

CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  name text NOT NULL,
  tier text NOT NULL DEFAULT 'basic',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price > 0),
  interval public.billing_interval NOT NULL DEFAULT 'monthly',
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  included_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT SELECT ON public.subscription_plans TO anon;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active OR auth.uid() = seller_id);
CREATE POLICY "Sellers can create their plans" ON public.subscription_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their plans" ON public.subscription_plans FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their plans" ON public.subscription_plans FOR DELETE TO authenticated USING (auth.uid() = seller_id);
CREATE TRIGGER subscription_plans_set_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  next_billing_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  pi_contract_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, subscriber_id)
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscribers and sellers can view subscriptions" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = subscriber_id OR EXISTS (SELECT 1 FROM public.subscription_plans p WHERE p.id = plan_id AND p.seller_id = auth.uid()));
CREATE POLICY "Subscribers can create their subscriptions" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = subscriber_id);
CREATE POLICY "Subscribers can update their subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = subscriber_id) WITH CHECK (auth.uid() = subscriber_id);
CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL,
  payment_id text,
  txid text,
  amount numeric NOT NULL,
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.subscription_payments TO authenticated;
GRANT ALL ON public.subscription_payments TO service_role;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscribers can view their subscription payments" ON public.subscription_payments FOR SELECT TO authenticated USING (auth.uid() = subscriber_id);
CREATE POLICY "Subscribers can record their subscription payments" ON public.subscription_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = subscriber_id);
CREATE TRIGGER subscription_payments_set_updated_at BEFORE UPDATE ON public.subscription_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_subscriptions_subscriber ON public.subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX idx_sub_payments_subscription ON public.subscription_payments(subscription_id);

-- points & referrals
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE CHECK (char_length(code) = 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL REFERENCES public.referral_codes(code) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'first_order_completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_user_id)
);
CREATE INDEX idx_points_transactions_user ON public.points_transactions(user_id);
CREATE INDEX idx_points_transactions_created ON public.points_transactions(created_at DESC);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE TRIGGER user_points_set_updated_at BEFORE UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER referrals_set_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.user_points TO authenticated;
GRANT ALL ON public.user_points TO service_role;
GRANT SELECT, INSERT ON public.points_transactions TO authenticated;
GRANT ALL ON public.points_transactions TO service_role;
GRANT SELECT, INSERT ON public.referral_codes TO authenticated;
GRANT SELECT ON public.referral_codes TO anon;
GRANT ALL ON public.referral_codes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.user_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.points_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.points_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own referral code" ON public.referral_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "Referred users can create referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_user_id);
CREATE POLICY "Referrers can update their referrals" ON public.referrals FOR UPDATE TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE OR REPLACE FUNCTION public.update_user_points_balance() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_points (user_id, balance, created_at, updated_at)
  VALUES (NEW.user_id, GREATEST(NEW.amount, 0), NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET balance = GREATEST(public.user_points.balance + NEW.amount, 0), updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_points_balance AFTER INSERT ON public.points_transactions FOR EACH ROW EXECUTE FUNCTION public.update_user_points_balance();