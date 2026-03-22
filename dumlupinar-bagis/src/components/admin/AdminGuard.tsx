import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase()

interface AdminGuardProps {
  children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()

  // If ADMIN_EMAIL is configured, check it; otherwise just check authentication
  const isAdmin = ADMIN_EMAIL
    ? isAuthenticated && user?.email?.toLowerCase() === ADMIN_EMAIL
    : isAuthenticated

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" aria-label="Yükleniyor" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
          <p className="text-sm text-gray-400">Giriş yapılan email: {user?.email}</p>
          <p className="text-sm text-gray-400">Beklenen: {ADMIN_EMAIL || '(tanımlı değil)'}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
