-- Add receipt URL to donations table for dekont tracking
ALTER TABLE public.donations ADD COLUMN receipt_url text;
