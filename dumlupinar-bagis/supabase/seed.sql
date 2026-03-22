-- Örnek ödeme kanalları
insert into public.payment_channels (label, icon_name, bank_name, iban, description, sort_order) values
  ('Banka Havalesi (Ziraat)', 'Building2', 'Ziraat Bankası', 'TR00 0001 0000 0000 0000 0000 00', 'Bağışınızın doğru ihtiyaçla eşleşmesi için açıklama kısmına malzeme kodunu yazınız', 1),
  ('Banka Havalesi (İş Bankası)', 'Building2', 'İş Bankası', 'TR00 0006 4000 0000 0000 0000 00', 'Bağışınızın doğru ihtiyaçla eşleşmesi için açıklama kısmına malzeme kodunu yazınız', 2);

-- Örnek bağış kalemleri
insert into public.donation_items (title, description, image_url, price, payment_ref, impact_text, target_amount, collected_amount, donor_count, custom_amount_min, status, sort_order) values
  ('Akıllı Tahta', '5. sınıf dersliği için 65 inç interaktif akıllı tahta', null, 25000, 'OKUL-001', '35 öğrencimiz bu akıllı tahta sayesinde interaktif derslerle öğrenecek', 25000, 5000, 2, 100, 'active', 1),
  ('Projektör', 'Konferans salonu için 4000 lümen projektör', null, 8500, 'OKUL-002', '120 öğrencimiz bu projektör ile görsel zenginlikte eğitim alacak', 8500, 0, 0, 50, 'active', 2),
  ('Bilgisayar Seti (10 Adet)', 'Bilişim laboratuvarı için masaüstü bilgisayar seti', null, 150000, 'OKUL-003', '200 öğrencimiz dijital dünyaya bu bilgisayarlarla adım atacak', 150000, 30000, 5, 500, 'active', 3),
  ('Kütüphane Kitap Seti', '500 adet eğitim ve hikaye kitabı', null, 12000, 'OKUL-004', 'Tüm okulumuz 500 kitaplık bu zengin kütüphane ile büyüyecek', 12000, 12000, 15, 25, 'completed', 4);

-- Örnek öğrenci ihtiyaçları
insert into public.student_needs (title, description, image_url, price, student_count, payment_ref, impact_text, target_amount, collected_amount, donor_count, custom_amount_min, status, sort_order) values
  ('Kışlık Ayakkabı', 'Kış aylarında okula yürüyerek gelen öğrencilerimiz için su geçirmez, sıcak tutan kışlık bot', null, 800, 13, 'OGR-001', 'Bu destek sayesinde 13 öğrencimiz kışı sıcak ayaklarla geçirecek', 10400, 1600, 2, 800, 'active', 1);

-- Örnek S.S.S
insert into public.faq_items (question, answer, category, sort_order, is_active) values
  ('Bağış nasıl yapılır?', 'İhtiyaç listesinden destek olmak istediğiniz kalemi seçin, tutarı belirleyin ve IBAN bilgilerini kullanarak banka havalesi yapın. Havale açıklamasına size verilen referans metnini yazmanız yeterlidir.', 'genel', 1, true),
  ('Bağışım vergi avantajı sağlar mı?', 'Evet. Gelir Vergisi Kanunu Madde 89/1-4 uyarınca, eğitim kurumlarına yapılan bağışlar gelir vergisi matrahından indirilebilir. Havale dekontunuz resmi bağış belgesi olarak kullanılabilir.', 'hukuki', 2, true),
  ('Şartlı bağış ne demektir?', 'Havale açıklamasında "şartıyla" ibaresi kullandığınızda, bağışınız yasal olarak şartlı bağış statüsüne girer. Bu durumda Okul-Aile Birliği, gönderdiğiniz tutarı yalnızca belirttiğiniz amaca harcamak zorundadır.', 'hukuki', 3, true),
  ('Bağışımın doğru yere ulaştığından nasıl emin olabilirim?', 'Her bağış kalemi için benzersiz bir referans kodu bulunmaktadır. Havale açıklamanıza bu kodu yazarak bağışınızın doğru ihtiyaçla eşleşmesini sağlarsınız. Ayrıca WhatsApp üzerinden okula bildirim gönderebilirsiniz.', 'genel', 4, true);
