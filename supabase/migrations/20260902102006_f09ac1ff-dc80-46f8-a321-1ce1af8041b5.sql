ALTER TABLE public.user_points ALTER COLUMN balance SET NOT NULL, ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.points_transactions ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.referral_codes ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.referrals ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL, ALTER COLUMN is_active SET NOT NULL, ALTER COLUMN is_featured SET NOT NULL;

REVOKE ALL ON FUNCTION public.update_user_points_balance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;