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
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
ON public.purchases FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
ON public.purchases FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER purchases_set_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX purchases_user_id_idx ON public.purchases (user_id);