-- Update all RLS policies from old admin email to new admin email
-- Old: bozkurt@dumlupinar.edu.tr
-- New: 741604birecik@gmail.com

-- ============================================
-- donation_items
-- ============================================
DROP POLICY IF EXISTS "Admin can read all donation items" ON public.donation_items;
DROP POLICY IF EXISTS "Admin can insert donation items" ON public.donation_items;
DROP POLICY IF EXISTS "Admin can update donation items" ON public.donation_items;
DROP POLICY IF EXISTS "Admin can delete donation items" ON public.donation_items;

CREATE POLICY "Admin can read all donation items"
  ON public.donation_items FOR SELECT
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can insert donation items"
  ON public.donation_items FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update donation items"
  ON public.donation_items FOR UPDATE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete donation items"
  ON public.donation_items FOR DELETE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- ============================================
-- payment_channels
-- ============================================
DROP POLICY IF EXISTS "Admin can read all payment channels" ON public.payment_channels;
DROP POLICY IF EXISTS "Admin can insert payment channels" ON public.payment_channels;
DROP POLICY IF EXISTS "Admin can update payment channels" ON public.payment_channels;
DROP POLICY IF EXISTS "Admin can delete payment channels" ON public.payment_channels;

CREATE POLICY "Admin can read all payment channels"
  ON public.payment_channels FOR SELECT
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can insert payment channels"
  ON public.payment_channels FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update payment channels"
  ON public.payment_channels FOR UPDATE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete payment channels"
  ON public.payment_channels FOR DELETE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- ============================================
-- donations
-- ============================================
DROP POLICY IF EXISTS "Admin can read donations" ON public.donations;
DROP POLICY IF EXISTS "Admin can update donations" ON public.donations;
DROP POLICY IF EXISTS "Admin can delete donations" ON public.donations;

CREATE POLICY "Admin can read donations"
  ON public.donations FOR SELECT
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update donations"
  ON public.donations FOR UPDATE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete donations"
  ON public.donations FOR DELETE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- ============================================
-- audit_log
-- ============================================
DROP POLICY IF EXISTS "Admin can read audit log" ON public.audit_log;

CREATE POLICY "Admin can read audit log"
  ON public.audit_log FOR SELECT
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- ============================================
-- storage: donation-images
-- ============================================
DROP POLICY IF EXISTS "Admin upload donation images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete donation images" ON storage.objects;

CREATE POLICY "Admin upload donation images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'donation-images'
    AND auth.jwt() ->> 'email' = '741604birecik@gmail.com'
  );

CREATE POLICY "Admin delete donation images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'donation-images'
    AND auth.jwt() ->> 'email' = '741604birecik@gmail.com'
  );

-- ============================================
-- student_needs
-- ============================================
DROP POLICY IF EXISTS "Admin can view all student needs" ON public.student_needs;
DROP POLICY IF EXISTS "Admin can insert student needs" ON public.student_needs;
DROP POLICY IF EXISTS "Admin can update student needs" ON public.student_needs;
DROP POLICY IF EXISTS "Admin can delete student needs" ON public.student_needs;

CREATE POLICY "Admin can view all student needs"
  ON public.student_needs FOR SELECT
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can insert student needs"
  ON public.student_needs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update student needs"
  ON public.student_needs FOR UPDATE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete student needs"
  ON public.student_needs FOR DELETE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- ============================================
-- student_donations
-- ============================================
DROP POLICY IF EXISTS "Admin can manage student donations" ON public.student_donations;

CREATE POLICY "Admin can manage student donations"
  ON public.student_donations FOR ALL
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- ============================================
-- faq_items
-- ============================================
DROP POLICY IF EXISTS "Admin can view all faq" ON public.faq_items;
DROP POLICY IF EXISTS "Admin can insert faq" ON public.faq_items;
DROP POLICY IF EXISTS "Admin can update faq" ON public.faq_items;
DROP POLICY IF EXISTS "Admin can delete faq" ON public.faq_items;

CREATE POLICY "Admin can view all faq"
  ON public.faq_items FOR SELECT
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can insert faq"
  ON public.faq_items FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can update faq"
  ON public.faq_items FOR UPDATE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

CREATE POLICY "Admin can delete faq"
  ON public.faq_items FOR DELETE
  USING (auth.jwt() ->> 'email' = '741604birecik@gmail.com');
