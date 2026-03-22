import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Lock, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

const MAX_ATTEMPTS = 5
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const IS_DEV = import.meta.env.DEV

export default function Login() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  // Countdown timer — in-memory only, server is the real enforcer
  useEffect(() => {
    if (!lockUntil) { setCountdown(0); return }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining <= 0) {
        setLockUntil(null)
        setAttempts(0)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [lockUntil])

  const isLocked = lockUntil !== null && lockUntil > Date.now()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked || submitting) return

    setSubmitting(true)
    setError('')

    const email = username.trim().toLowerCase()

    try {
      // Use server-side rate-limited login via Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/rate-limit-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.status === 429) {
        // Server-side rate limit hit
        const retrySeconds = data.retry_after || 300
        const until = Date.now() + retrySeconds * 1000
        setLockUntil(until)
        setAttempts(MAX_ATTEMPTS)
        setError(`Çok fazla deneme. ${Math.ceil(retrySeconds / 60)} dakika bekleyin.`)
      } else if (!response.ok) {
        // Auth error
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        const remaining = data.remaining_attempts ?? (MAX_ATTEMPTS - newAttempts)
        if (remaining <= 0) {
          const retrySeconds = data.retry_after || 300
          const until = Date.now() + retrySeconds * 1000
          setLockUntil(until)
          setError(`Çok fazla deneme. ${Math.ceil(retrySeconds / 60)} dakika bekleyin.`)
        } else {
          setError(`Geçersiz kullanıcı adı veya şifre (${remaining} deneme kaldı)`)
        }
      } else {
        // Success — set session from Edge Function response
        if (data.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
        }
        setAttempts(0)
        navigate('/admin/dashboard')
      }
    } catch {
      if (IS_DEV) {
        // Development only: direct login when Edge Function is unavailable
        const { error: authError } = await login(email, password)
        if (authError) {
          setError(authError.message)
        } else {
          setAttempts(0)
          navigate('/admin/dashboard')
        }
      } else {
        // Production: fail-closed, do NOT fall back to direct login
        setError('Giriş servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.')
      }
    }

    setSubmitting(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>{t('login.title')}</title>
      </Helmet>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">{t('login.heading')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
            <input
              id="login-username"
              type="email"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder={t('login.email_placeholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base"
              autoFocus
              disabled={isLocked}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder={t('login.password_placeholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base"
              disabled={isLocked}
              autoComplete="current-password"
            />
            {error && (
              <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {isLocked && countdown > 0 && (
              <p className="text-amber-600 text-sm mt-2 font-medium">
                Tekrar deneyebilmek için {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} bekleyin
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLocked || submitting}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
