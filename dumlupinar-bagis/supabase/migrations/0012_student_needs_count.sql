-- Add student_count to track how many students need this item
ALTER TABLE public.student_needs ADD COLUMN student_count integer not null default 1;
