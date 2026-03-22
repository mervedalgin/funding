import { useEffect, useRef, useState } from 'react'

interface ProgressBarProps {
  collected: number
  target: number
}

export default function ProgressBar({ collected, target }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((collected / target) * 100, 100) : 0
  const barRef = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1.5">
        <span className="font-medium">₺{collected.toLocaleString('tr-TR')}</span>
        <span>₺{target.toLocaleString('tr-TR')}</span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Bağış ilerlemesi: %${percentage.toFixed(0)}`}
      >
        <div
          ref={barRef}
          className={`h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000 ease-out ${
            percentage >= 90 ? 'animate-pulse-soft' : ''
          }`}
          style={{ width: animated ? `${percentage}%` : '0%' }}
        >
          {percentage >= 25 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">
              %{percentage.toFixed(0)}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">%{percentage.toFixed(0)} hedefe ulaşıldı</p>
    </div>
  )
}
