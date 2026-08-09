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