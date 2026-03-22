-- Yeni settings key'leri için varsayılan değerler (tablo varsa)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'site_settings') then
    execute $sql$
      INSERT INTO public.site_settings (key, value) VALUES
        ('seo', '{"meta_title": "Dumlupınar İlkokulu — Bağış Sayfası", "meta_description": "Dumlupınar İlkokulu ve Ortaokulu bağış sayfası — Birecik, Şanlıurfa", "og_image_url": "", "plausible_domain": "dumlupinar-bagis.vercel.app", "auto_sitemap": true}')
      ON CONFLICT (key) DO NOTHING
    $sql$;
  end if;
end $$;
