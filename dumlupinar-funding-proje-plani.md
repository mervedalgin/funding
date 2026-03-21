# Dumlupınar İlkokulu — Bağış / Funding Sayfası
## Proje Planı & Altyapı Dökümanı

> **Seçenek A** (Havale / IBAN Yönlendirme) · Supabase Backend · React + Vite + Tailwind v4

---

## Sürüm Tablosu (Mart 2026 İtibarıyla Güncel)

| Paket / Araç | Sürüm | Notlar |
|---|---|---|
| Node.js | **v22.x LTS** | Aktif LTS (Nisan 2027'ye kadar destekli). `node -v` ile kontrol et |
| npm | **v10+** | `npm -v` ile kontrol et |
| React | **19.x** | |
| React DOM | **19.x** | |
| Vite | **8.x** | `npm create vite@latest` ile kurulur |
| TypeScript | **5.x** | |
| @vitejs/plugin-react | **latest** | SWC tabanlı derleyici |
| tailwindcss | **4.x** | v4 — `tailwind.config.js` artık gerekmiyor |
| @tailwindcss/vite | **4.2.2+** | PostCSS yerine Vite plugin kullanılıyor |
| react-router-dom | **7.x** | |
| @supabase/supabase-js | **^2.80.0** | |
| supabase CLI (npm) | **2.83.0** | Dev dependency olarak kurulur |

---

## Proje Mimarisi

```
dumlupinar-bagis/
├── supabase/                   ← Supabase CLI tarafından oluşturulur
│   ├── migrations/             ← SQL migration dosyaları
│   │   └── 0001_init.sql
│   ├── seed.sql                ← Test verisi
│   └── config.toml             ← Lokal ortam konfigürasyonu
│
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts   ← Supabase bağlantısı
│   ├── types/
│   │   └── donation.ts         ← DonationItem tip tanımı
│   ├── hooks/
│   │   └── useDonationItems.ts ← CRUD hook
│   ├── pages/
│   │   ├── Home.tsx            ← Halk sayfası (ihtiyaç kartları)
│   │   ├── ItemDetail.tsx      ← Detay + ödeme yönlendirme
│   │   └── admin/
│   │       ├── Login.tsx       ← Şifreli giriş
│   │       └── Dashboard.tsx   ← Yönetim paneli
│   ├── components/
│   │   ├── DonationCard.tsx
│   │   ├── DonationModal.tsx
│   │   ├── AmountSelector.tsx      ← [1] Tam / Yarı / Katkı tutar seçici
│   │   ├── PaymentMethods.tsx      ← [3] Ödeme yöntemi ikonları + linkleri
│   │   ├── ImpactBadge.tsx         ← [5] "47 öğrenciye hizmet eder" etki metni
│   │   ├── ProgressBar.tsx         ← [5] Hedef / toplanan bağış göstergesi
│   │   └── admin/
│   │       ├── ItemForm.tsx
│   │       └── ItemTable.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               ← Sadece @import "tailwindcss"
│
├── .env.local                  ← Supabase anahtarları (git'e ekleme!)
├── .gitignore
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 1. Supabase CLI Kurulumu

> Supabase CLI, local development için **Docker** gerektirir. Docker Desktop'ın kurulu ve çalışıyor olması lazım.

### Yöntem A — NPM (Dev Dependency olarak, önerilen)

```bash
# Proje klasörüne gir
npm install -D supabase@latest

# Versiyon kontrol
npx supabase --version
# → 2.83.0

# PATH kısayolu için package.json'a ekle (opsiyonel)
# "scripts": { "sb": "supabase" }
```

### Yöntem B — Homebrew (macOS / Linux global)

```bash
brew install supabase/tap/supabase
supabase --version
```

### Yöntem C — Scoop (Windows global)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

> ⚠️ `npm install -g supabase` desteklenmiyor. Global kullanım için Homebrew veya Scoop kullan.

---

## 2. Proje Kurulumu (Adım Adım)

### 2.1 Vite + React + TypeScript projesi oluştur

```bash
npm create vite@latest dumlupinar-bagis -- --template react-ts
cd dumlupinar-bagis
npm install
```

> Node.js sürümünü `node -v` ile kontrol et — **v22.x** görmen gerekiyor.
> Farklı bir sürüm varsa: `nvm install 22 && nvm use 22`

### 2.2 Tailwind CSS v4 kur

```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.ts`** dosyasını güncelle:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**`src/index.css`** dosyasının içeriğini tamamen şununla değiştir:

```css
@import "tailwindcss";
```

> v4'te `tailwind.config.js` ve `@tailwind base/components/utilities` direktifleri **artık kullanılmıyor**.

### 2.3 React Router v7 kur

```bash
npm install react-router-dom@latest
```

### 2.4 Supabase JS SDK kur

```bash
npm install @supabase/supabase-js@latest
```

### 2.5 Supabase CLI'ı dev dependency olarak ekle

```bash
npm install -D supabase@latest
```

### 2.6 Diğer yardımcı paketler (opsiyonel ama önerilen)

```bash
# İkon seti
npm install lucide-react

# Form validasyonu
npm install react-hook-form zod @hookform/resolvers
```

---

## 3. Supabase Lokal Ortam Başlatma

```bash
# Supabase başlat (Docker çalışıyor olmalı)
npx supabase init

# Lokal servisleri ayağa kaldır
npx supabase start
```

`supabase start` çıktısında şunları göreceksin:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
        anon key: eyJhbG...   ← bunu kopyala
service_role key: eyJhbG...
```

Bu anahtarları `.env.local` dosyasına yapıştır:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbG...   ← yukarıdaki anon key
```

---

## 4. Veritabanı Şeması

`supabase/migrations/0001_init.sql` dosyasını oluştur:

```sql
-- Bağış ihtiyaç kalemleri tablosu
create table public.donation_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  price       numeric(10, 2) not null default 0,
  
  -- Seçenek A: Ödeme bilgileri (IBAN + açıklama kodu)
  bank_name   text,              -- örn: "Ziraat Bankası"
  iban        text,              -- TR12 0001 0012 3456 7890 1234 56
  payment_ref text,              -- açıklama kodu, örn: "OKUL-001"
  payment_url text,              -- opsiyonel harici link (QR sayfa vs.)

  -- [5] Etki metni ve bağışçı sayacı
  impact_text       text,               -- "Bu projektör 47 öğrenciye hizmet eder"
  donor_count       integer default 0,  -- Kaç kişi bağış yaptı göstergesi

  -- [1] Tutar seçici için minimum katkı tutarı
  -- Tam = price, Yarısı = price/2 otomatik hesaplanır, Katkı = serbest tutar
  custom_amount_min numeric(10, 2) default 10,

  -- Bağış takip
  target_amount    numeric(10, 2) default 0,
  collected_amount numeric(10, 2) default 0,

  -- [3] İnternet bankacılığı yönlendirme linki
  internet_banking_url text,

  -- Durum yönetimi
  status      text not null default 'draft'
                check (status in ('active', 'draft', 'completed')),
  sort_order  integer default 0,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- [3] Ödeme kanalları tablosu — tüm ihtiyaçlar için ortak banka bilgileri
create table public.payment_channels (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,      -- "Banka Havalesi", "İnternet Bankacılığı"
  icon_name    text,               -- lucide-react icon: "Building2", "Globe", "Smartphone"
  bank_name    text,               -- "Ziraat Bankası"
  iban         text,               -- TR12 0001 ...
  description  text,               -- "Açıklama kısmına malzeme kodunu yazınız"
  url          text,               -- harici link (opsiyonel)
  is_active    boolean default true,
  sort_order   integer default 0
);

alter table public.payment_channels enable row level security;
create policy "Public can read active payment channels"
  on public.payment_channels for select
  using (is_active = true);

-- Otomatik updated_at güncellemesi
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger donation_items_updated_at
  before update on public.donation_items
  for each row execute function update_updated_at();

-- RLS (Row Level Security) — sadece aktif kayıtlar halka açık
alter table public.donation_items enable row level security;

-- Halk: sadece aktif kayıtları okuyabilir
create policy "Public can read active items"
  on public.donation_items for select
  using (status = 'active');

-- Admin: service_role key ile tam erişim (lokal + Edge Function'dan)
-- Uygulama katmanında admin şifre kontrolü yapıldığı için
-- şimdilik service_role kullanılacak
```

Migration'ı uygula:

```bash
npx supabase db reset
# veya sadece yeni migration için:
npx supabase migration up
```

---

## 5. Supabase Client Bağlantısı

**`src/lib/supabaseClient.ts`**:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin işlemleri için — service role key SADECE sunucu tarafında kullanılır
// Frontend'de service role key kullanma! Şimdilik admin sayfası
// şifre kontrolü uygulama katmanında yapılacak, ileride Edge Function'a taşı.
```

TypeScript tip üretimi:

```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

---

## 6. Veri Tipi

**`src/types/donation.ts`**:

```ts
export type DonationStatus = 'active' | 'draft' | 'completed'

export type AmountOption = 'full' | 'half' | 'custom'

export interface DonationItem {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: number

  // [1] Tutar seçici
  custom_amount_min: number       // Katkı seçeneğinde minimum tutar

  // [3] Ödeme bilgileri
  bank_name: string | null
  iban: string | null
  payment_ref: string | null
  payment_url: string | null
  internet_banking_url: string | null

  // [5] Etki metni ve ilerleme
  impact_text: string | null      // "Bu projektör 47 öğrenciye hizmet eder"
  donor_count: number
  target_amount: number
  collected_amount: number

  status: DonationStatus
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PaymentChannel {
  id: string
  label: string                   // "Banka Havalesi"
  icon_name: string | null        // lucide-react icon adı
  bank_name: string | null
  iban: string | null
  description: string | null
  url: string | null
  is_active: boolean
  sort_order: number
}

export type NewDonationItem = Omit<DonationItem, 'id' | 'created_at' | 'updated_at'>
```

---

## 7. Sayfa Yapısı (Route Planı)

| Route | Bileşen | Açıklama |
|---|---|---|
| `/` | `Home.tsx` | Aktif ihtiyaç kartları (grid) — ImpactBadge + ProgressBar |
| `/item/:id` | `ItemDetail.tsx` | Detay + AmountSelector [1] + PaymentMethods [3] + ImpactBadge [5] |
| `/admin` | `admin/Login.tsx` | Şifreli giriş |
| `/admin/dashboard` | `admin/Dashboard.tsx` | Yönetim paneli (ekle/düzenle/sil) |
| `/admin/payment-channels` | `admin/PaymentChannels.tsx` | [3] Ödeme kanalları yönetimi |

---

## 8. Seçenek A — Ödeme Yönlendirme Mantığı

Hayırsever "Bağış Yap" butonuna tıkladığında:

1. `ItemDetail` sayfası açılır (resim, açıklama, fiyat, etki metni)
2. **[1] Tutar Seçici** (`AmountSelector`) gösterilir:
   - **Tam Tutar** — malzemenin tam fiyatı (örn: `₺2.400`)
   - **Yarısını Karşıla** — fiyatın yarısı (örn: `₺1.200`)
   - **Katkı Yap** — serbest tutar girişi (minimum `custom_amount_min`)
3. **[3] Ödeme Yöntemi İkonları** (`PaymentMethods`) gösterilir:
   - 🏦 Banka Havalesi → IBAN kopyalanabilir kutu + açıklama kodu
   - 🌐 İnternet Bankacılığı → `internet_banking_url` adresine yönlendir
   - Kanallar `payment_channels` tablosundan dinamik olarak gelir
4. **[5] Etki Metni + İlerleme Çubuğu** her kartta ve detay sayfasında görünür:
   - `impact_text`: "Bu projektör 47 öğrenciye hizmet eder"
   - `donor_count`: "3 kişi bağış yaptı"
   - Progress bar: `collected_amount / target_amount`

```
Hayırsever Akışı:
  Ana Sayfa (ImpactBadge + ProgressBar)
    → Kart Tıkla
    → Detay Sayfası
        → Tutar Seç (Tam / Yarı / Katkı)  [1]
        → Ödeme Yöntemi Seç (Havale / İnternet Bankacılığı) [3]
        → IBAN Kopyala → Bankadan EFT Yap
        → (veya) İnternet Bankacılığı Sayfasına Git
```

---

## 9. Admin Paneli Güvenliği

Şimdilik basit şifre koruması (lokal / MVP aşaması için yeterli):

```ts
// src/pages/admin/Login.tsx
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

// .env.local içinde:
// VITE_ADMIN_PASSWORD=dumlupinar2025
```

> ⚠️ Üretim ortamına geçildiğinde Supabase Auth + Row Level Security kullanılmalı.
> Admin şifresini `.env.local`'e al, kaynak koduna yazma.

---

## 10. Üretim Ortamına Geçiş

```bash
# 1. Supabase cloud projesi oluştur → supabase.com/dashboard
# 2. CLI ile bağlan
npx supabase login
npx supabase link --project-ref <proje-id>

# 3. Migration'ları uzak veritabanına uygula
npx supabase db push

# 4. .env.local'i production değerleriyle güncelle
VITE_SUPABASE_URL=https://<proje-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<cloud-anon-key>

# 5. Build al
npm run build

# 6. Deploy (Vercel, Netlify, vb.)
# Çevre değişkenlerini dashboard'dan gir
```

---

## 11. Faydalı CLI Komutları

```bash
# Lokal servisleri başlat / durdur
npx supabase start
npx supabase stop

# Studio (görsel DB editörü) → http://127.0.0.1:54323
# Tarayıcıda otomatik açılır

# Yeni migration dosyası oluştur
npx supabase migration new <migration_adi>

# Veritabanını sıfırla (tüm migration'ları yeniden uygular)
npx supabase db reset

# TypeScript tiplerini yeniden üret
npx supabase gen types typescript --local > src/types/supabase.ts

# Lokal durumu kontrol et
npx supabase status
```

---

## 12. package.json — Tam Bağımlılık Listesi

```json
{
  "name": "dumlupinar-bagis",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "sb": "supabase",
    "types": "supabase gen types typescript --local > src/types/supabase.ts"
  },
  "notes": {
    "[1] AmountSelector": "Tam / Yarısını Karşıla / Katkı Yap — ItemDetail içinde kullanılır",
    "[3] PaymentMethods": "payment_channels tablosundan dinamik, lucide-react ikonlu",
    "[5] ImpactBadge + ProgressBar": "impact_text, donor_count, collected/target göstergesi"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.80.0",
    "lucide-react": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.x",
    "react-router-dom": "^7.0.0",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "latest",
    "supabase": "^2.83.0",
    "tailwindcss": "^4.2.2",
    "typescript": "^5.0.0",
    "vite": "^8.0.0"
  }
}
```

---

## Sonraki Adımlar

1. `npm create vite@latest dumlupinar-bagis -- --template react-ts` ile projeyi kur
2. Bağımlılıkları yükle (`npm install`)
3. `npx supabase init` + `npx supabase start`
4. Migration dosyasını oluştur ve `npx supabase db reset` ile uygula
5. `seed.sql` içine örnek `payment_channels` kayıtlarını gir (Ziraat / İş Bankası vb.)
6. `.env.local` dosyasını ayarla
6. **Agent ekibini** çalıştır: Data → Frontend → Admin sırasıyla

---

*Dumlupınar İlkokulu ve Ortaokulu — Birecik, Şanlıurfa*
*Hazırlanma: Mart 2026*
