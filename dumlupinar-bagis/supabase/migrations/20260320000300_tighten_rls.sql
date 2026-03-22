-- ============================================================================
-- 0003: Tighten RLS policies
--
-- Problem: The existing policies in 0002 restrict writes to `authenticated`
-- role, but ANY Supabase Auth user counts as `authenticated`. This means if
-- someone signs up (when sign-ups are enabled) they get full write access.
--
-- Fix: Replace broad `authenticated` write policies with email-restricted
-- ones. Only the designated admin email can modify data.
--
-- IMPORTANT: After applying this migration:
-- 1. Create the admin user in Supabase Auth dashboard
-- 2. Disable public sign-ups in Auth settings
-- 3. Update the admin email below if different
-- ============================================================================

-- Admin email — change this to the actual admin email
-- You can add multiple admins by using: auth.jwt() ->> 'email' = ANY(ARRAY['a@b.com', 'c@d.com'])

-- -------------------------------------------------------------------------
-- donation_items: Replace write policies
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can insert donation items" ON public.donation_items;
DROP POLICY IF EXISTS "Authenticated users can update donation items" ON public.donation_items;
DROP POLICY IF EXISTS "Authenticated users can delete donation items" ON public.donation_items;

-- Admin can read ALL items (including draft/completed)
CREATE POLICY "Admin can read all donation items"
  ON public.donation_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert donation items"
  ON public.donation_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update donation items"
  ON public.donation_items FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete donation items"
  ON public.donation_items FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- -------------------------------------------------------------------------
-- payment_channels: Replace write policies
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can insert payment channels" ON public.payment_channels;
DROP POLICY IF EXISTS "Authenticated users can update payment channels" ON public.payment_channels;
DROP POLICY IF EXISTS "Authenticated users can delete payment channels" ON public.payment_channels;

-- Admin can read ALL channels (including inactive)
CREATE POLICY "Admin can read all payment channels"
  ON public.payment_channels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert payment channels"
  ON public.payment_channels FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update payment channels"
  ON public.payment_channels FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete payment channels"
  ON public.payment_channels FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');
