import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

interface AdminGuardProps {
  children: ReactNode
}

/**
 * Verifies admin status via Supabase session + DB settings.
 * Falls back to VITE_ADMIN_EMAIL env var check for initial setup.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()

  // Check admin email from settings table (DB source of truth)
  // Falls back to env var if settings not available
  const isAdmin = isAuthenticated && !!user?.email && checkAdminEmail(user.email)

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" aria-label="Yükleniyor" />
      </div>
    )
  }

  if (!isAdmin) return null

  return <>{children}</>
}

// Cache admin email from settings to avoid repeated queries
let cachedAdminEmail: string | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function checkAdminEmail(email: string): boolean {
  const envEmail = import.meta.env.VITE_ADMIN_EMAIL || ''

  // Refresh cache if stale
  if (Date.now() - cacheTimestamp > CACHE_TTL) {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'notification')
      .single()
      .then(({ data }) => {
        if (data?.value?.admin_email) {
          cachedAdminEmail = data.value.admin_email
          cacheTimestamp = Date.now()
        }
      })
  }

  const adminEmail = cachedAdminEmail || envEmail
  return email.toLowerCase() === adminEmail.toLowerCase()
}
