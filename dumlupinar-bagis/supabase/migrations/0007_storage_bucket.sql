-- ============================================================================
-- 0007: Storage bucket for donation images
--
-- Bagis kalemleri icin resim yukleme altyapisi.
-- Public okuma, sadece admin yukleme ve silme yapabilir.
-- ============================================================================

-- donation-images bucket
insert into storage.buckets (id, name, public)
values ('donation-images', 'donation-images', true);

-- Public read policy
create policy "Public read donation images"
on storage.objects for select
using (bucket_id = 'donation-images');

-- Admin upload policy
create policy "Admin upload donation images"
on storage.objects for insert
with check (
  bucket_id = 'donation-images'
  and auth.jwt() ->> 'email' = 'bozkurt@dumlupinar.edu.tr'
);

-- Admin delete policy
create policy "Admin delete donation images"
on storage.objects for delete
using (
  bucket_id = 'donation-images'
  and auth.jwt() ->> 'email' = 'bozkurt@dumlupinar.edu.tr'
);
