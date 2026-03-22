-- Yeni settings key'leri için varsayılan değerler
-- Mevcut key'ler korunuyor, client DEFAULT_SETTINGS ile merge ediyor

INSERT INTO public.site_settings (key, value) VALUES
  ('seo', '{"meta_title": "Dumlupınar İlkokulu — Bağış Sayfası", "meta_description": "Dumlupınar İlkokulu ve Ortaokulu bağış sayfası — Birecik, Şanlıurfa", "og_image_url": "", "plausible_domain": "dumlupinar-bagis.vercel.app", "auto_sitemap": true}')
ON CONFLICT (key) DO NOTHING;
