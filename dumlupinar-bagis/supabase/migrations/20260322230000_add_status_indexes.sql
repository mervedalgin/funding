-- Performance indexes for status-filtered queries (slug indexes already exist in 20260322220000)
CREATE INDEX IF NOT EXISTS idx_donation_items_status ON public.donation_items(status);
CREATE INDEX IF NOT EXISTS idx_student_needs_status ON public.student_needs(status);
