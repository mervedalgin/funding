import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import '../styles/animations.css'

type ToastType = 'success' | 'error'

interface Toast {
  id: number
  message: string
  type: ToastType
  exiting: boolean
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const startExit = useCallback(
    (id: number) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      )
      // Remove after slide-out animation completes
      setTimeout(() => removeToast(id), 300)
    },
    [removeToast]
  )

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type, exiting: false }])

      // Auto-dismiss after 2.5s
      setTimeout(() => startExit(id), 2500)
    },
    [startExit]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

/* ---------- Internal Toast Renderer ---------- */

const typeStyles: Record<ToastType, string> = {
  success: 'bg-primary-600 text-white',
  error: 'bg-red-600 text-white',
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse items-center gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const animationStyle: React.CSSProperties = {
    animation: toast.exiting
      ? 'slideOutDown 0.3s ease-in forwards'
      : 'slideInUp 0.3s ease-out forwards',
  }

  return (
    <div
      role="status"
      style={animationStyle}
      className={`pointer-events-auto px-5 py-3 rounded-xl shadow-lg text-sm font-medium whitespace-nowrap ${typeStyles[toast.type]}`}
    >
      {toast.message}
    </div>
  )
}
