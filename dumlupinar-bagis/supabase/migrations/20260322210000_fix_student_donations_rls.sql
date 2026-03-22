-- student_donations INSERT policy anon rolünü içermiyor — düzelt
DROP POLICY IF EXISTS "Anyone can create student donations" ON public.student_donations;

CREATE POLICY "Anyone can create student donations"
  ON public.student_donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
