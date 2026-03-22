import { useState, useEffect, useRef } from 'react'
import { Package, Target, TrendingUp, Heart } from 'lucide-react'
import type { DonationItem } from '../../types/donation'
import { formatCurrency } from '../../lib/formatters'

interface StatsCardsProps {
  items: DonationItem[]
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    prevTarget.current = target

    const start = 0
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}

function StatCard({ label, rawValue, formattedValue, icon: Icon, color }: {
  label: string
  rawValue: number
  formattedValue: (v: number) => string
  icon: React.ComponentType<{ size?: number }>
  color: string
}) {
  const animated = useCountUp(rawValue)

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className={`${color} rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{formattedValue(animated)}</p>
      </div>
    </div>
  )
}

export default function StatsCards({ items }: StatsCardsProps) {
  const totalItems = items.length
  const totalTarget = items.reduce((sum, item) => sum + item.target_amount, 0)
  const totalCollected = items.reduce((sum, item) => sum + item.collected_amount, 0)
  const totalDonors = items.reduce((sum, item) => sum + item.donor_count, 0)

  const stats = [
    {
      label: 'Toplam Kalem',
      rawValue: totalItems,
      formattedValue: (v: number) => v.toString(),
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Hedef Tutar',
      rawValue: totalTarget,
      formattedValue: (v: number) => formatCurrency(v),
      icon: Target,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Toplanan Tutar',
      rawValue: totalCollected,
      formattedValue: (v: number) => formatCurrency(v),
      icon: TrendingUp,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Toplam Bağışçı',
      rawValue: totalDonors,
      formattedValue: (v: number) => v.toString(),
      icon: Heart,
      color: 'bg-rose-100 text-rose-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
