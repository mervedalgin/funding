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

  const isAdmin = isAuthenticated && !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL

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
