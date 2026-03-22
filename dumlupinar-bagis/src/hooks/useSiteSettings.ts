import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface GeneralSettings {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
  logo_url: string
  whatsapp_phone: string
  social_instagram: string
  social_twitter: string
  social_facebook: string
  social_youtube: string
  footer_text: string
  copyright_text: string
}

export interface DonationSettings {
  min_amount: number
  max_amount: number
  auto_approve: boolean
  show_donor_names: boolean
  show_collected_amounts: boolean
  allow_anonymous: boolean
  thank_you_message: string
}

export interface NotificationSettings {
  email_on_new_donation: boolean
  email_on_goal_reached: boolean
  whatsapp_notification: boolean
  weekly_summary: boolean
  admin_email: string
}

export interface AppearanceSettings {
  maintenance_mode: boolean
  announcement_text: string
  announcement_active: boolean
  primary_color: string
}

export interface SeoSettings {
  meta_title: string
  meta_description: string
  og_image_url: string
  plausible_domain: string
  auto_sitemap: boolean
}

export interface SiteSettings {
  general: GeneralSettings
  donation: DonationSettings
  notification: NotificationSettings
  appearance: AppearanceSettings
  seo: SeoSettings
}

const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    site_name: 'Dumlupınar İlkokulu Bağış Platformu',
    site_description: 'Dumlupınar İlkokulu ve Ortaokulu öğrencileri için bağış toplama platformu',
    contact_email: 'bagis@dumlupinar.edu.tr',
    contact_phone: '',
    address: '',
    logo_url: '',
    whatsapp_phone: import.meta.env.VITE_WHATSAPP_PHONE || '',
    social_instagram: '',
    social_twitter: '',
    social_facebook: '',
    social_youtube: '',
    footer_text: '',
    copyright_text: 'Dumlupınar İlkokulu ve Ortaokulu — Birecik, Şanlıurfa',
  },
  donation: {
    min_amount: 10,
    max_amount: 999999,
    auto_approve: false,
    show_donor_names: true,
    show_collected_amounts: true,
    allow_anonymous: true,
    thank_you_message: 'Bağışınız okulumuzun öğrencileri için çok değerli. Desteğiniz hayat değiştiriyor.',
  },
  notification: {
    email_on_new_donation: true,
    email_on_goal_reached: true,
    whatsapp_notification: false,
    weekly_summary: false,
    admin_email: import.meta.env.VITE_ADMIN_EMAIL || '',
  },
  appearance: {
    maintenance_mode: false,
    announcement_text: '',
    announcement_active: false,
    primary_color: '#0d9488',
  },
  seo: {
    meta_title: 'Dumlupınar İlkokulu — Bağış Sayfası',
    meta_description: 'Dumlupınar İlkokulu ve Ortaokulu bağış sayfası — Birecik, Şanlıurfa. Okulumuzun ihtiyaçları için destek olun.',
    og_image_url: '',
    plausible_domain: 'dumlupinar-bagis.vercel.app',
    auto_sitemap: true,
  },
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (!error && data) {
      const merged = { ...DEFAULT_SETTINGS }
      for (const row of data) {
        const key = row.key as keyof SiteSettings
        if (key in merged) {
          merged[key] = { ...merged[key], ...(row.value as Record<string, unknown>) } as never
        }
      }
      setSettings(merged)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = useCallback(async <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSaving(true)
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value: value as unknown, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) {
      setSaving(false)
      throw error
    }

    setSettings(prev => ({ ...prev, [key]: value }))
    setSaving(false)
  }, [])

  return { settings, loading, saving, updateSettings, refetch: fetchSettings }
}
