-- ============================================================================
-- 0006: Public donors read policy
--
-- Anonim kullanicilar sadece onaylanmis (confirmed) bagislarin
-- donor_name ve amount bilgilerini okuyabilir.
-- Bu, bagisci listesini herkese acik olarak gostermeyi saglar.
-- ============================================================================

-- Anonim kullanicilar confirmed bagislari okuyabilir
create policy "Public can read confirmed donations"
  on public.donations for select
  to anon
  using (status = 'confirmed');
