import { useState, useCallback, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Globe,
  HandCoins,
  Bell,
  Palette,
  Save,
  Loader2,
  Info,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminToast from '../../components/admin/AdminToast'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import type {
  GeneralSettings,
  DonationSettings,
  NotificationSettings,
  AppearanceSettings,
  SiteSettings,
} from '../../hooks/useSiteSettings'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

type SettingsTab = 'general' | 'donation' | 'notification' | 'appearance' | 'security'

const TABS: { id: SettingsTab; label: string; icon: typeof Globe }[] = [
  { id: 'general', label: 'Genel', icon: Globe },
  { id: 'donation', label: 'Bağış', icon: HandCoins },
  { id: 'notification', label: 'Bildirimler', icon: Bell },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'security', label: 'Güvenlik', icon: Shield },
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

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
    />
  )
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
    />
  )
}

function NumberInput({
  value,
  onChange,
  min,
  step,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        step={step}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
      )}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-all group"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? 'bg-primary-500' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}

// ── Tab content components ──

function GeneralTab({
  data,
  onChange,
}: {
  data: GeneralSettings
  onChange: (d: GeneralSettings) => void
}) {
  const update = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) =>
    onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <SectionCard title="Site Bilgileri" description="Platformun temel bilgilerini yönetin.">
        <FieldRow label="Site Adı" hint="Tarayıcı başlığı ve header'da görünür">
          <TextInput value={data.site_name} onChange={(v) => update('site_name', v)} placeholder="Site adı" />
        </FieldRow>
        <FieldRow label="Açıklama" hint="SEO ve meta açıklama için kullanılır">
          <TextArea value={data.site_description} onChange={(v) => update('site_description', v)} placeholder="Site açıklaması" />
        </FieldRow>
      </SectionCard>

      <SectionCard title="İletişim Bilgileri" description="Ziyaretçilerin sizinle iletişime geçmesi için.">
        <FieldRow label="E-posta">
          <TextInput value={data.contact_email} onChange={(v) => update('contact_email', v)} placeholder="ornek@dumlupinar.edu.tr" type="email" />
        </FieldRow>
        <FieldRow label="Telefon">
          <TextInput value={data.contact_phone} onChange={(v) => update('contact_phone', v)} placeholder="+90 xxx xxx xx xx" />
        </FieldRow>
        <FieldRow label="Adres">
          <TextArea value={data.address} onChange={(v) => update('address', v)} placeholder="Üniversite adresi" rows={2} />
        </FieldRow>
      </SectionCard>
    </div>
  )
}

function DonationTab({
  data,
  onChange,
}: {
  data: DonationSettings
  onChange: (d: DonationSettings) => void
}) {
  const update = <K extends keyof DonationSettings>(key: K, value: DonationSettings[K]) =>
    onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <SectionCard title="Bağış Kuralları" description="Bağış kabul sürecini yapılandırın.">
        <FieldRow label="Minimum Tutar" hint="Kabul edilecek en düşük bağış tutarı">
          <NumberInput value={data.min_amount} onChange={(v) => update('min_amount', v)} min={1} step={1} suffix="TL" />
        </FieldRow>
        <Toggle
          checked={data.auto_approve}
          onChange={(v) => update('auto_approve', v)}
          label="Otomatik Onay"
          description="Gelen bağışları manuel onay gerektirmeden otomatik onayla"
        />
        <Toggle
          checked={data.allow_anonymous}
          onChange={(v) => update('allow_anonymous', v)}
          label="Anonim Bağışa İzin Ver"
          description="Bağışçıların isim vermeden bağış yapmasına izin ver"
        />
      </SectionCard>

      <SectionCard title="Görünürlük" description="Hangi bilgilerin herkese açık olacağını belirleyin.">
        <Toggle
          checked={data.show_donor_names}
          onChange={(v) => update('show_donor_names', v)}
          label="Bağışçı İsimlerini Göster"
          description="Onaylanmış bağışçıların isimlerini sitede listele"
        />
        <Toggle
          checked={data.show_collected_amounts}
          onChange={(v) => update('show_collected_amounts', v)}
          label="Toplanan Tutarları Göster"
          description="Her kalem için toplanan bağış tutarını göster"
        />
      </SectionCard>
    </div>
  )
}

function NotificationTab({
  data,
  onChange,
}: {
  data: NotificationSettings
  onChange: (d: NotificationSettings) => void
}) {
  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) =>
    onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <SectionCard title="E-posta Bildirimleri" description="Hangi olaylarda bildirim alacağınızı ayarlayın.">
        <FieldRow label="Bildirim E-postası" hint="Bildirimlerin gönderileceği adres">
          <TextInput value={data.admin_email} onChange={(v) => update('admin_email', v)} placeholder="admin@dumlupinar.edu.tr" type="email" />
        </FieldRow>
        <Toggle
          checked={data.email_on_new_donation}
          onChange={(v) => update('email_on_new_donation', v)}
          label="Yeni Bağış Bildirimi"
          description="Her yeni bağış geldiğinde e-posta ile bildirim al"
        />
        <Toggle
          checked={data.email_on_goal_reached}
          onChange={(v) => update('email_on_goal_reached', v)}
          label="Hedef Tamamlandı Bildirimi"
          description="Bir bağış kalemi hedefine ulaştığında bildirim al"
        />
      </SectionCard>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Bildirim Notu</p>
          <p className="text-xs text-blue-600 mt-0.5">
            E-posta bildirimleri Supabase Edge Functions üzerinden gönderilir. Aktif bir e-posta
            servis sağlayıcısı yapılandırması gereklidir.
          </p>
        </div>
      </div>
    </div>
  )
}

function AppearanceTab({
  data,
  onChange,
}: {
  data: AppearanceSettings
  onChange: (d: AppearanceSettings) => void
}) {
  const update = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) =>
    onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <SectionCard title="Bakım Modu" description="Siteyi geçici olarak bakım moduna alın.">
        <Toggle
          checked={data.maintenance_mode}
          onChange={(v) => update('maintenance_mode', v)}
          label="Bakım Modu"
          description="Aktifken ziyaretçiler bakım sayfası görür, admin paneli etkilenmez"
        />
        {data.maintenance_mode && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Bakım modu aktif! Ziyaretçiler siteye erişemeyecek.
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Duyuru Bandı" description="Site üstünde görünecek duyuru mesajı.">
        <Toggle
          checked={data.announcement_active}
          onChange={(v) => update('announcement_active', v)}
          label="Duyuru Bandını Göster"
          description="Sayfanın üstünde bir bilgi bandı gösterir"
        />
        {data.announcement_active && (
          <FieldRow label="Duyuru Metni">
            <TextArea
              value={data.announcement_text}
              onChange={(v) => update('announcement_text', v)}
              placeholder="Duyuru metnini girin..."
              rows={2}
            />
          </FieldRow>
        )}
      </SectionCard>

      <SectionCard title="Tema" description="Sitenin renk temasını özelleştirin.">
        <FieldRow label="Ana Renk" hint="Butonlar ve vurgularda kullanılır">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.primary_color}
              onChange={(e) => update('primary_color', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <TextInput value={data.primary_color} onChange={(v) => update('primary_color', v)} placeholder="#0d9488" />
          </div>
        </FieldRow>
      </SectionCard>
    </div>
  )
}

function SecurityTab() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordResult, setPasswordResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordResult({ type: 'error', message: 'Tüm alanları doldurun.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordResult({ type: 'error', message: 'Yeni şifre en az 8 karakter olmalıdır.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordResult({ type: 'error', message: 'Yeni şifreler uyuşmuyor.' })
      return
    }

    setChangingPassword(true)
    setPasswordResult(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordResult({ type: 'error', message: error.message })
    } else {
      setPasswordResult({ type: 'success', message: 'Şifre başarıyla güncellendi.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Hesap Bilgileri" description="Mevcut oturum bilgileriniz.">
        <FieldRow label="E-posta">
          <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
            {user?.email ?? '—'}
          </div>
        </FieldRow>
        <FieldRow label="Son Giriş">
          <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
            {user?.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString('tr-TR')
              : '—'}
          </div>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Şifre Değiştir" description="Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.">
        <FieldRow label="Mevcut Şifre">
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mevcut şifreniz"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="Yeni Şifre" hint="En az 8 karakter">
          <input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yeni şifreniz"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </FieldRow>
        <FieldRow label="Şifre Tekrar">
          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Yeni şifrenizi tekrar girin"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </FieldRow>

        {passwordResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              passwordResult.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {passwordResult.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            {passwordResult.message}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handlePasswordChange}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="inline-flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {changingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Şifreyi Güncelle
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

// ── Main Settings Page ──

export default function Settings() {
  const { settings, loading, saving, updateSettings } = useSiteSettings()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [dirty, setDirty] = useState(false)

  // Local draft state for each settings section
  const [general, setGeneral] = useState(settings.general)
  const [donation, setDonation] = useState(settings.donation)
  const [notification, setNotification] = useState(settings.notification)
  const [appearance, setAppearance] = useState(settings.appearance)

  // Sync local state when remote settings load
  useEffect(() => {
    setGeneral(settings.general)
    setDonation(settings.donation)
    setNotification(settings.notification)
    setAppearance(settings.appearance)
  }, [settings])

  const handleGeneralChange = useCallback((d: GeneralSettings) => { setGeneral(d); setDirty(true) }, [])
  const handleDonationChange = useCallback((d: DonationSettings) => { setDonation(d); setDirty(true) }, [])
  const handleNotificationChange = useCallback((d: NotificationSettings) => { setNotification(d); setDirty(true) }, [])
  const handleAppearanceChange = useCallback((d: AppearanceSettings) => { setAppearance(d); setDirty(true) }, [])

  const handleSave = async () => {
    try {
      const tabKeyMap: Record<string, { key: keyof SiteSettings; value: SiteSettings[keyof SiteSettings] }> = {
        general: { key: 'general', value: general },
        donation: { key: 'donation', value: donation },
        notification: { key: 'notification', value: notification },
        appearance: { key: 'appearance', value: appearance },
      }

      const current = tabKeyMap[activeTab]
      if (current) {
        await updateSettings(current.key, current.value)
      }

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
          {activeTab !== 'security' && (
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                dirty
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Kaydet
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setDirty(false) }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {activeTab === 'general' && <GeneralTab data={general} onChange={handleGeneralChange} />}
          {activeTab === 'donation' && <DonationTab data={donation} onChange={handleDonationChange} />}
          {activeTab === 'notification' && <NotificationTab data={notification} onChange={handleNotificationChange} />}
          {activeTab === 'appearance' && <AppearanceTab data={appearance} onChange={handleAppearanceChange} />}
          {activeTab === 'security' && <SecurityTab />}
        </div>

        {/* Floating save bar when dirty */}
        {dirty && activeTab !== 'security' && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-gray-200 px-6 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Kaydedilmemiş değişiklikler var
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setGeneral(settings.general)
                    setDonation(settings.donation)
                    setNotification(settings.notification)
                    setAppearance(settings.appearance)
                    setDirty(false)
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px]"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px] shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </AdminLayout>
  )
}
