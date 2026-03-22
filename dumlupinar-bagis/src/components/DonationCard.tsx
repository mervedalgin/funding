import { Link } from 'react-router-dom'
import { Package, TrendingUp, Sparkles, Heart, Users, ArrowRight, CheckCircle } from 'lucide-react'
import type { DonationItem } from '../types/donation'
import { getOptimizedImageUrl } from '../lib/imageUtils'
import { isSecureImageUrl } from '../lib/validation'

interface DonationCardProps {
  item: DonationItem
}

export default function DonationCard({ item }: DonationCardProps) {
  const isCompleted = item.status === 'completed'
  const progressPercent = item.target_amount > 0 ? Math.min((item.collected_amount / item.target_amount) * 100, 100) : 0
  const isNearGoal = progressPercent >= 80 && progressPercent < 100
  const isFirstDonor = item.donor_count === 0 && !isCompleted

  return (
    <Link
      to={`/ihtiyac/${item.slug}`}
      className="group block relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
    >
      {/* Image section with overlay */}
      <div className="relative overflow-hidden">
        {item.image_url && isSecureImageUrl(item.image_url) ? (
          <img
            src={getOptimizedImageUrl(item.image_url, 400, 300) ?? item.image_url}
            alt={item.title}
            loading="lazy"
            width={400}
            height={300}
            className="w-full h-44 sm:h-52 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-44 sm:h-52 bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100 flex items-center justify-center relative">
            <Package className="w-16 h-16 text-primary-300 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(13,148,136,0.08),transparent_70%)]" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <CheckCircle className="w-3.5 h-3.5" />
            Tamamlandı
          </div>
        )}

        {/* Urgency badges */}
        {isNearGoal && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse-soft">
            <TrendingUp className="w-3.5 h-3.5" />
            Hedefe Yakın!
          </div>
        )}

        {isFirstDonor && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            İlk Sen Ol!
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2 shadow-lg group-hover:scale-105 transition-transform duration-300">
          <span className="text-xl font-bold text-primary-700">₺{item.price.toLocaleString('tr-TR')}</span>
        </div>

        {/* Donor count pill */}
        {item.donor_count > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="text-xs font-semibold text-gray-700">{item.donor_count}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
        )}

        {/* Impact text */}
        {item.impact_text && (
          <div className="flex items-start gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
            <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">{item.impact_text}</p>
          </div>
        )}

        {/* Progress bar */}
        {item.target_amount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                <span className="font-semibold text-primary-700">₺{item.collected_amount.toLocaleString('tr-TR')}</span>
                {' / '}
                ₺{item.target_amount.toLocaleString('tr-TR')}
              </span>
              <span className={`font-bold ${
                progressPercent >= 80 ? 'text-emerald-600' : 'text-gray-600'
              }`}>
                %{progressPercent.toFixed(0)}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  progressPercent >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  : progressPercent >= 80 ? 'bg-gradient-to-r from-primary-400 to-emerald-500'
                  : progressPercent >= 50 ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                  : 'bg-gradient-to-r from-primary-300 to-primary-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        {!isCompleted && (
          <div className="pt-1">
            <span className="cta-btn w-full bg-gradient-to-r from-primary-500 to-teal-600 text-white py-3 rounded-xl font-semibold group-hover:from-primary-600 group-hover:to-teal-700 group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-all duration-300 min-h-[44px] flex items-center justify-center gap-2 group-hover:scale-[1.02]">
              <Heart className="w-4 h-4 cta-heartbeat" />
              Destek Ol
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
