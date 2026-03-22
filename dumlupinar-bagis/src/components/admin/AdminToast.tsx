import { useEffect } from 'react'
import { X } from 'lucide-react'

interface AdminToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function AdminToast({ message, type, onClose }: AdminToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgClass = type === 'success'
    ? 'bg-green-600'
    : 'bg-red-600'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`${bgClass} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px]`}
      >
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
