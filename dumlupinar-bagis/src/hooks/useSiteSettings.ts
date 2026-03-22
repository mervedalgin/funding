import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface GeneralSettings {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
}

export interface DonationSettings {
  min_amount: number
  auto_approve: boolean
  show_donor_names: boolean
  show_collected_amounts: boolean
  allow_anonymous: boolean
}

export interface NotificationSettings {
  email_on_new_donation: boolean
  email_on_goal_reached: boolean
  admin_email: string
}

export interface AppearanceSettings {
  maintenance_mode: boolean
  announcement_text: string
  announcement_active: boolean
  primary_color: string
}

export interface SiteSettings {
  general: GeneralSettings
  donation: DonationSettings
  notification: NotificationSettings
  appearance: AppearanceSettings
}

const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    site_name: 'Dumlupınar Üniversitesi Bağış Platformu',
    site_description: 'Dumlupınar Üniversitesi öğrencileri için bağış toplama platformu',
    contact_email: 'bagis@dumlupinar.edu.tr',
    contact_phone: '',
    address: '',
  },
  donation: {
    min_amount: 10,
    auto_approve: false,
    show_donor_names: true,
    show_collected_amounts: true,
    allow_anonymous: true,
  },
  notification: {
    email_on_new_donation: true,
    email_on_goal_reached: true,
    admin_email: 'bozkurt@dumlupinar.edu.tr',
  },
  appearance: {
    maintenance_mode: false,
    announcement_text: '',
    announcement_active: false,
    primary_color: '#0d9488',
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
