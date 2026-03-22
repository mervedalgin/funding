import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface EditPanelProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export default function EditPanel({ isOpen, onClose, children, title }: EditPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'edit-panel-title' : undefined}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          {title && <h2 id="edit-panel-title" className="text-lg font-semibold text-gray-800">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {isOpen && children}
        </div>
      </div>
    </>
  )
}
