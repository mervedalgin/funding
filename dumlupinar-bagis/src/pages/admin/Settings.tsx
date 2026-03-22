import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Settings as SettingsIcon, Globe, HandCoins, Bell, Palette, Save, Loader2,
  Info, Shield, Eye, EyeOff, CheckCircle2, AlertTriangle, Search as SearchIcon,
  Upload, ImageIcon, X as XIcon, ExternalLink, Send, Plug, BarChart3,
  Instagram, Twitter, Facebook, Youtube, MessageSquare,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminToast from '../../components/admin/AdminToast'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import type {
  GeneralSettings, DonationSettings, NotificationSettings,
  AppearanceSettings, SeoSettings, SiteSettings,
} from '../../hooks/useSiteSettings'
import { useAuditLog } from '../../hooks/useAuditLog'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { processImageWithPreview } from '../../lib/imageUtils'
import { uploadImage } from '../../lib/storage'
import { formatRelativeTime } from '../../lib/formatters'

type SettingsTab = 'general' | 'donation' | 'notification' | 'appearance' | 'seo' | 'security' | 'integrations'

const TABS: { id: SettingsTab; label: string; icon: typeof Globe }[] = [
  { id: 'general', label: 'Genel', icon: Globe },
  { id: 'donation', label: 'Bağış', icon: HandCoins },
  { id: 'notification', label: 'Bildirimler', icon: Bell },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'seo', label: 'SEO', icon: SearchIcon },
  { id: 'security', label: 'Güvenlik', icon: Shield },
  { id: 'integrations', label: 'Entegrasyonlar', icon: Plug },
]

// ── Reusable form components ──

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  )
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-start">
      <div className="sm:pt-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
  )
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none" />
  )
}

function NumberInput({ value, onChange, min, max, step, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div className="relative">
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-all group">
      <div className="text-left">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status: 'active' | 'inactive' | 'warning' }) {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const labels = { active: 'Aktif', inactive: 'Pasif', warning: 'Yapılandırılmamış' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : status === 'inactive' ? 'bg-red-500' : 'bg-amber-500'}`} />
      {labels[status]}
    </span>
  )
}

// ── Tab content components ──

function GeneralTab({ data, onChange }: { data: GeneralSettings; onChange: (d: GeneralSettings) => void }) {
  const update = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => onChange({ ...data, [key]: value })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const { file: processed } = await processImageWithPreview(file)
      const url = await uploadImage(processed)
      update('logo_url', url)
    } catch {
      setUploadError('Logo yüklenirken hata oluştu')
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Site Bilgileri" description="Platformun temel bilgilerini yönetin.">
        <FieldRow label="Site Adı" hint="Tarayıcı başlığı ve header'da görünür">
          <TextInput value={data.site_name} onChange={(v) => update('site_name', v)} placeholder="Site adı" />
        </FieldRow>
        <FieldRow label="Açıklama" hint="SEO ve meta açıklama için kullanılır">
          <TextArea value={data.site_description} onChange={(v) => update('site_description', v)} placeholder="Site açıklaması" />
        </FieldRow>
        <FieldRow label="Logo" hint="Site logosu (otomatik optimize edilir)">
          <div className="flex items-center gap-4">
            {data.logo_url ? (
              <div className="relative group">
                <img src={data.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                <button type="button" onClick={() => update('logo_url', '')} className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <XIcon className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                <ImageIcon className="w-6 h-6 text-gray-300" />
              </div>
            )}
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Yükleniyor...' : 'Logo Yükle'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>
          </div>
        </FieldRow>
      </SectionCard>

      <SectionCard title="İletişim Bilgileri" description="Ziyaretçilerin sizinle iletişime geçmesi için.">
        <FieldRow label="E-posta"><TextInput value={data.contact_email} onChange={(v) => update('contact_email', v)} placeholder="ornek@dumlupinar.edu.tr" type="email" /></FieldRow>
        <FieldRow label="Telefon"><TextInput value={data.contact_phone} onChange={(v) => update('contact_phone', v)} placeholder="+90 xxx xxx xx xx" /></FieldRow>
        <FieldRow label="WhatsApp" hint="Bağış bildirimlerinde kullanılır"><TextInput value={data.whatsapp_phone} onChange={(v) => update('whatsapp_phone', v)} placeholder="905XXXXXXXXX" /></FieldRow>
        <FieldRow label="Adres"><TextArea value={data.address} onChange={(v) => update('address', v)} placeholder="Okul adresi" rows={2} /></FieldRow>
      </SectionCard>

      <SectionCard title="Sosyal Medya" description="Sosyal medya hesaplarınızın linkleri.">
        <FieldRow label="Instagram"><div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500 shrink-0" /><TextInput value={data.social_instagram} onChange={(v) => update('social_instagram', v)} placeholder="https://instagram.com/..." /></div></FieldRow>
        <FieldRow label="Twitter / X"><div className="flex items-center gap-2"><Twitter className="w-4 h-4 text-gray-700 shrink-0" /><TextInput value={data.social_twitter} onChange={(v) => update('social_twitter', v)} placeholder="https://x.com/..." /></div></FieldRow>
        <FieldRow label="Facebook"><div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600 shrink-0" /><TextInput value={data.social_facebook} onChange={(v) => update('social_facebook', v)} placeholder="https://facebook.com/..." /></div></FieldRow>
        <FieldRow label="YouTube"><div className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600 shrink-0" /><TextInput value={data.social_youtube} onChange={(v) => update('social_youtube', v)} placeholder="https://youtube.com/..." /></div></FieldRow>
      </SectionCard>

      <SectionCard title="Footer" description="Sayfa altı bilgilerini özelleştirin.">
        <FieldRow label="Footer Metni" hint="Sayfanın altında görünecek metin">
          <TextArea value={data.footer_text} onChange={(v) => update('footer_text', v)} placeholder="Ek bilgi veya mesaj..." rows={2} />
        </FieldRow>
        <FieldRow label="Telif Hakkı" hint="&copy; ile birlikte gösterilir">
          <TextInput value={data.copyright_text} onChange={(v) => update('copyright_text', v)} placeholder="Kurum adı — Şehir" />
        </FieldRow>
      </SectionCard>
    </div>
  )
}

function DonationTab({ data, onChange }: { data: DonationSettings; onChange: (d: DonationSettings) => void }) {
  const update = <K extends keyof DonationSettings>(key: K, value: DonationSettings[K]) => onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <SectionCard title="Bağış Kuralları" description="Bağış kabul sürecini yapılandırın.">
        <FieldRow label="Minimum Tutar" hint="Kabul edilecek en düşük bağış"><NumberInput value={data.min_amount} onChange={(v) => update('min_amount', v)} min={1} step={1} suffix="TL" /></FieldRow>
        <FieldRow label="Maksimum Tutar" hint="Kabul edilecek en yüksek bağış"><NumberInput value={data.max_amount} onChange={(v) => update('max_amount', v)} min={1} step={1} suffix="TL" /></FieldRow>
        <Toggle checked={data.auto_approve} onChange={(v) => update('auto_approve', v)} label="Otomatik Onay" description="Gelen bağışları manuel onay gerektirmeden otomatik onayla" />
        <Toggle checked={data.allow_anonymous} onChange={(v) => update('allow_anonymous', v)} label="Anonim Bağışa İzin Ver" description="Bağışçıların isim vermeden bağış yapmasına izin ver" />
      </SectionCard>

      <SectionCard title="Görünürlük" description="Hangi bilgilerin herkese açık olacağını belirleyin.">
        <Toggle checked={data.show_donor_names} onChange={(v) => update('show_donor_names', v)} label="Bağışçı İsimlerini Göster" description="Onaylanmış bağışçıların isimlerini sitede listele" />
        <Toggle checked={data.show_collected_amounts} onChange={(v) => update('show_collected_amounts', v)} label="Toplanan Tutarları Göster" description="Her kalem için toplanan bağış tutarını göster" />
      </SectionCard>

      <SectionCard title="Teşekkür Mesajı" description="Bağış sonrası gösterilen mesaj.">
        <FieldRow label="Mesaj" hint="Bağış tamamlandıktan sonra bağışçıya gösterilir">
          <TextArea value={data.thank_you_message} onChange={(v) => update('thank_you_message', v)} placeholder="Teşekkür mesajınız..." rows={3} />
        </FieldRow>
      </SectionCard>
    </div>
  )
}

function NotificationTab({ data, onChange }: { data: NotificationSettings; onChange: (d: NotificationSettings) => void }) {
  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => onChange({ ...data, [key]: value })
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleTestEmail = async () => {
    setSendingTest(true)
    setTestResult(null)
    try {
      const { data: fnData, error } = await supabase.functions.invoke('notify-donation', {
        body: {
          record: {
            donor_name: 'Test Bağışçı',
            amount: 100,
            payment_ref: 'TEST-001',
            created_at: new Date().toISOString(),
            donor_email: 'test@example.com',
          },
        },
      })
      if (error) throw error
      if (fnData?.warning) {
        setTestResult({ type: 'error', msg: fnData.warning })
      } else {
        setTestResult({ type: 'success', msg: 'Test e-postası gönderildi!' })
      }
    } catch {
      setTestResult({ type: 'error', msg: 'E-posta gönderilemedi. Edge Function veya API key yapılandırmasını kontrol edin.' })
    }
    setSendingTest(false)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="E-posta Bildirimleri" description="Hangi olaylarda bildirim alacağınızı ayarlayın.">
        <FieldRow label="Bildirim E-postası" hint="Bildirimlerin gönderileceği adres">
          <TextInput value={data.admin_email} onChange={(v) => update('admin_email', v)} placeholder="admin@dumlupinar.edu.tr" type="email" />
        </FieldRow>
        <Toggle checked={data.email_on_new_donation} onChange={(v) => update('email_on_new_donation', v)} label="Yeni Bağış Bildirimi" description="Her yeni bağış geldiğinde e-posta ile bildirim al" />
        <Toggle checked={data.email_on_goal_reached} onChange={(v) => update('email_on_goal_reached', v)} label="Hedef Tamamlandı Bildirimi" description="Bir bağış kalemi hedefine ulaştığında bildirim al" />
        <Toggle checked={data.weekly_summary} onChange={(v) => update('weekly_summary', v)} label="Haftalık Özet" description="Her hafta bağış özetini e-posta ile al" />
      </SectionCard>

      <SectionCard title="WhatsApp" description="WhatsApp üzerinden bildirimler.">
        <Toggle checked={data.whatsapp_notification} onChange={(v) => update('whatsapp_notification', v)} label="WhatsApp Bildirimi" description="Yeni bağışlarda WhatsApp bildirim linki göster" />
      </SectionCard>

      <SectionCard title="Test" description="Bildirim ayarlarınızı test edin.">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleTestEmail} disabled={sendingTest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 min-h-[44px]">
            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Test E-postası Gönder
          </button>
          {testResult && (
            <span className={`text-sm ${testResult.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.msg}
            </span>
          )}
        </div>
      </SectionCard>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Bildirim Notu</p>
          <p className="text-xs text-blue-600 mt-0.5">E-posta bildirimleri Supabase Edge Functions + Resend API üzerinden gönderilir.</p>
        </div>
      </div>
    </div>
  )
}

function AppearanceTab({ data, onChange }: { data: AppearanceSettings; onChange: (d: AppearanceSettings) => void }) {
  const update = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <SectionCard title="Bakım Modu" description="Siteyi geçici olarak bakım moduna alın.">
        <Toggle checked={data.maintenance_mode} onChange={(v) => update('maintenance_mode', v)} label="Bakım Modu" description="Aktifken ziyaretçiler bakım sayfası görür" />
        {data.maintenance_mode && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">Bakım modu aktif! Ziyaretçiler siteye erişemeyecek.</p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Duyuru Bandı" description="Site üstünde görünecek duyuru mesajı.">
        <Toggle checked={data.announcement_active} onChange={(v) => update('announcement_active', v)} label="Duyuru Bandını Göster" />
        {data.announcement_active && (
          <FieldRow label="Duyuru Metni"><TextArea value={data.announcement_text} onChange={(v) => update('announcement_text', v)} placeholder="Duyuru metnini girin..." rows={2} /></FieldRow>
        )}
      </SectionCard>

      <SectionCard title="Tema" description="Sitenin renk temasını özelleştirin.">
        <FieldRow label="Ana Renk" hint="Butonlar ve vurgularda kullanılır">
          <div className="flex items-center gap-3">
            <input type="color" value={data.primary_color} onChange={(e) => update('primary_color', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <TextInput value={data.primary_color} onChange={(v) => update('primary_color', v)} placeholder="#0d9488" />
          </div>
        </FieldRow>
      </SectionCard>
    </div>
  )
}

function SeoTab({ data, onChange }: { data: SeoSettings; onChange: (d: SeoSettings) => void }) {
  const update = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => onChange({ ...data, [key]: value })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { file: processed } = await processImageWithPreview(file)
      const url = await uploadImage(processed)
      update('og_image_url', url)
    } catch { /* silently fail */ }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Meta Bilgileri" description="Arama motorları ve sosyal medya paylaşımları için.">
        <FieldRow label="Sayfa Başlığı" hint="Tarayıcı sekmesinde ve Google'da görünür">
          <TextInput value={data.meta_title} onChange={(v) => update('meta_title', v)} placeholder="Site başlığı" />
        </FieldRow>
        <FieldRow label="Meta Açıklama" hint="Google arama sonuçlarında gösterilir">
          <TextArea value={data.meta_description} onChange={(v) => update('meta_description', v)} placeholder="Site açıklaması (max 160 karakter)" rows={2} />
          <p className="text-xs text-gray-400 mt-1">{data.meta_description.length}/160 karakter</p>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Sosyal Medya Önizleme" description="Paylaşımlarda görünecek görsel.">
        <FieldRow label="OG Image" hint="1200x630px önerilen boyut">
          <div className="space-y-3">
            {data.og_image_url && (
              <div className="relative group">
                <img src={data.og_image_url} alt="OG Preview" className="w-full max-w-md h-40 object-cover rounded-xl border border-gray-200" />
                <button type="button" onClick={() => update('og_image_url', '')} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <XIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleOgImageUpload} className="hidden" />
          </div>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Analitik" description="Site trafiği izleme.">
        <FieldRow label="Plausible Domain" hint="Plausible Analytics site domain'i">
          <TextInput value={data.plausible_domain} onChange={(v) => update('plausible_domain', v)} placeholder="dumlupinar-bagis.vercel.app" />
        </FieldRow>
        <Toggle checked={data.auto_sitemap} onChange={(v) => update('auto_sitemap', v)} label="Otomatik Sitemap" description="sitemap.xml dosyasını otomatik oluştur" />
      </SectionCard>
    </div>
  )
}

function SecurityTab() {
  const { user } = useAuth()
  const { entries, loading: auditLoading, tableFilter, setTableFilter, actionFilter, setActionFilter } = useAuditLog(50)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordResult, setPasswordResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handlePasswordChange = async () => {
    setPasswordResult(null)
    if (!newPassword || !confirmPassword) { setPasswordResult({ type: 'error', message: 'Tüm alanları doldurun.' }); return }
    if (newPassword.length < 8) { setPasswordResult({ type: 'error', message: 'Yeni şifre en az 8 karakter olmalıdır.' }); return }
    if (newPassword !== confirmPassword) { setPasswordResult({ type: 'error', message: 'Yeni şifreler uyuşmuyor.' }); return }

    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordResult({ type: 'error', message: error.message })
    } else {
      setPasswordResult({ type: 'success', message: 'Şifre başarıyla güncellendi.' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  const ACTION_LABELS: Record<string, string> = { INSERT: 'Ekleme', UPDATE: 'Güncelleme', DELETE: 'Silme', create: 'Ekleme', update: 'Güncelleme', delete: 'Silme' }
  const TABLE_LABELS: Record<string, string> = {
    donation_items: 'Bağış Kalemleri', payment_channels: 'Ödeme Kanalları',
    student_needs: 'Öğrenci İhtiyaçları', student_donations: 'Öğrenci Bağışları',
    faq_items: 'S.S.S', legal_basis_items: 'Yasal Dayanak',
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Hesap Bilgileri" description="Mevcut oturum bilgileriniz.">
        <FieldRow label="E-posta">
          <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">{user?.email ?? '—'}</div>
        </FieldRow>
        <FieldRow label="Son Giriş">
          <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
            {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : '—'}
          </div>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Şifre Değiştir" description="Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.">
        <FieldRow label="Mevcut Şifre">
          <div className="relative">
            <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Mevcut şifreniz"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
            <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="Yeni Şifre" hint="En az 8 karakter">
          <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Yeni şifreniz"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
        </FieldRow>
        <FieldRow label="Şifre Tekrar">
          <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Tekrar girin"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
        </FieldRow>
        {passwordResult && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${passwordResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {passwordResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {passwordResult.message}
          </div>
        )}
        <button onClick={handlePasswordChange} disabled={changingPassword || !newPassword || !confirmPassword}
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 min-h-[44px]">
          {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Şifreyi Güncelle
        </button>
      </SectionCard>

      <SectionCard title="Denetim Günlüğü" description="Son admin işlemleri.">
        <div className="flex items-center gap-2 mb-4">
          <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="all">Tüm Tablolar</option>
            {Object.entries(TABLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="all">Tüm İşlemler</option>
            <option value="INSERT">Ekleme</option>
            <option value="UPDATE">Güncelleme</option>
            <option value="DELETE">Silme</option>
          </select>
        </div>

        {auditLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Henüz kayıt yok</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pr-4">Tarih</th>
                  <th className="pb-3 pr-4">Tablo</th>
                  <th className="pb-3 pr-4">İşlem</th>
                  <th className="pb-3">Kayıt ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{formatRelativeTime(entry.created_at)}</td>
                    <td className="py-2.5 pr-4"><span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{TABLE_LABELS[entry.table_name] || entry.table_name}</span></td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        entry.action === 'DELETE' || entry.action === 'delete' ? 'bg-red-50 text-red-600' :
                        entry.action === 'INSERT' || entry.action === 'create' ? 'bg-green-50 text-green-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>{ACTION_LABELS[entry.action] || entry.action}</span>
                    </td>
                    <td className="py-2.5 text-gray-400 font-mono text-xs">{entry.record_id?.slice(0, 8) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function IntegrationsTab() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const hasPlausible = !!document.querySelector('script[data-domain]')

  const integrations = [
    {
      name: 'Plausible Analytics',
      description: 'Gizlilik dostu web analitik servisi',
      status: hasPlausible ? 'active' as const : 'inactive' as const,
      detail: hasPlausible ? 'index.html\'de yapılandırılmış' : 'Script tag bulunamadı',
      icon: BarChart3,
    },
    {
      name: 'Resend Email',
      description: 'E-posta bildirim servisi (Edge Function)',
      status: 'warning' as const,
      detail: 'Supabase Edge Function + RESEND_API_KEY gerekli',
      icon: Send,
    },
    {
      name: 'Supabase',
      description: 'Veritabanı, Auth ve Storage',
      status: SUPABASE_URL ? 'active' as const : 'inactive' as const,
      detail: SUPABASE_URL ? `Bağlı: ${new URL(SUPABASE_URL).hostname}` : 'Yapılandırılmamış',
      icon: Plug,
    },
    {
      name: 'Ödeme Gateway',
      description: 'Iyzico / PayTR kredi kartı entegrasyonu',
      status: 'warning' as const,
      detail: 'Edge Function iskelet seviyesinde — gateway credentials gerekli',
      icon: HandCoins,
    },
    {
      name: 'WhatsApp Business',
      description: 'Bağış bildirim mesajları',
      status: import.meta.env.VITE_WHATSAPP_PHONE ? 'active' as const : 'inactive' as const,
      detail: import.meta.env.VITE_WHATSAPP_PHONE ? 'Numara yapılandırılmış' : 'Telefon numarası ayarlanmamış',
      icon: MessageSquare,
    },
  ]

  return (
    <div className="space-y-6">
      <SectionCard title="Entegrasyon Durumları" description="Bağlı servislerin durumunu kontrol edin.">
        <div className="space-y-4">
          {integrations.map((int) => (
            <div key={int.name} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <int.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-800">{int.name}</h4>
                  <StatusBadge status={int.status} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{int.description}</p>
                <p className="text-xs text-gray-500 mt-1">{int.detail}</p>
              </div>
              {int.status === 'warning' && (
                <ExternalLink className="w-4 h-4 text-gray-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500">
          Entegrasyon yapılandırmaları Supabase Dashboard ve Vercel Environment Variables üzerinden yönetilir.
          Bu sayfa sadece mevcut durumu gösterir.
        </p>
      </div>
    </div>
  )
}

// ── Main Settings Page ──

export default function Settings() {
  const { settings, loading, saving, updateSettings } = useSiteSettings()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [dirty, setDirty] = useState(false)

  const [general, setGeneral] = useState(settings.general)
  const [donation, setDonation] = useState(settings.donation)
  const [notification, setNotification] = useState(settings.notification)
  const [appearance, setAppearance] = useState(settings.appearance)
  const [seo, setSeo] = useState(settings.seo)

  useEffect(() => {
    setGeneral(settings.general)
    setDonation(settings.donation)
    setNotification(settings.notification)
    setAppearance(settings.appearance)
    setSeo(settings.seo)
  }, [settings])

  const handleGeneralChange = useCallback((d: GeneralSettings) => { setGeneral(d); setDirty(true) }, [])
  const handleDonationChange = useCallback((d: DonationSettings) => { setDonation(d); setDirty(true) }, [])
  const handleNotificationChange = useCallback((d: NotificationSettings) => { setNotification(d); setDirty(true) }, [])
  const handleAppearanceChange = useCallback((d: AppearanceSettings) => { setAppearance(d); setDirty(true) }, [])
  const handleSeoChange = useCallback((d: SeoSettings) => { setSeo(d); setDirty(true) }, [])

  const saveable = activeTab !== 'security' && activeTab !== 'integrations'

  const handleSave = async () => {
    try {
      const tabKeyMap: Record<string, { key: keyof SiteSettings; value: SiteSettings[keyof SiteSettings] }> = {
        general: { key: 'general', value: general },
        donation: { key: 'donation', value: donation },
        notification: { key: 'notification', value: notification },
        appearance: { key: 'appearance', value: appearance },
        seo: { key: 'seo', value: seo },
      }
      const current = tabKeyMap[activeTab]
      if (current) await updateSettings(current.key, current.value)
      setDirty(false)
      setToast({ message: 'Ayarlar başarıyla kaydedildi', type: 'success' })
    } catch {
      setToast({ message: 'Ayarlar kaydedilirken hata oluştu', type: 'error' })
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Ayarlar</h1>
              <p className="text-sm text-gray-500">Platform yapılandırmasını yönetin</p>
            </div>
          </div>
          {saveable && (
            <button onClick={handleSave} disabled={saving || !dirty}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                dirty ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setDirty(false) }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === 'general' && <GeneralTab data={general} onChange={handleGeneralChange} />}
          {activeTab === 'donation' && <DonationTab data={donation} onChange={handleDonationChange} />}
          {activeTab === 'notification' && <NotificationTab data={notification} onChange={handleNotificationChange} />}
          {activeTab === 'appearance' && <AppearanceTab data={appearance} onChange={handleAppearanceChange} />}
          {activeTab === 'seo' && <SeoTab data={seo} onChange={handleSeoChange} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
        </div>

        {/* Floating save bar */}
        {dirty && saveable && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-gray-200 px-6 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="text-sm text-gray-600">Kaydedilmemiş değişiklikler var</p>
              <div className="flex items-center gap-3">
                <button onClick={() => { setGeneral(settings.general); setDonation(settings.donation); setNotification(settings.notification); setAppearance(settings.appearance); setSeo(settings.seo); setDirty(false) }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px]">
                  Vazgeç
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px] shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  )
}
