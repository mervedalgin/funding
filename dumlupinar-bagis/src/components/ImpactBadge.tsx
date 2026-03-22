import { Heart, Star } from 'lucide-react'

interface ImpactBadgeProps {
  impactText: string | null
  donorCount: number
}

export default function ImpactBadge({ impactText, donorCount }: ImpactBadgeProps) {
  return (
    <div className="space-y-1.5">
      {impactText && (
        <p className="text-sm text-accent-700 bg-accent-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
          {impactText}
        </p>
      )}
      {donorCount > 0 && (
        <p className="text-sm text-gray-500 flex items-center gap-1 justify-center">
          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          {donorCount} hayırsever destek oldu
        </p>
      )}
    </div>
  )
}
