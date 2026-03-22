import { useState } from 'react'
import {
  Package,
  TrendingUp,
  Users,
  Target,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { DonationItem } from '../../types/donation'
import { formatCurrency } from '../../lib/formatters'

interface ItemCardGridProps {
  items: DonationItem[]
  onEdit: (item: DonationItem) => void
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Aktif', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  draft: { label: 'Taslak', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
  completed: { label: 'Tamamlandı', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
}

const ITEMS_PER_PAGE = 9

export default function ItemCardGrid({ items, onEdit, onDelete, onStatusChange }: ItemCardGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedItems = items.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Henüz bağış kalemi yok</p>
        <p className="text-gray-400 text-sm mt-1">Yeni bir kalem ekleyerek başlayın</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginatedItems.map((item, index) => {
          const status = statusConfig[item.status] || statusConfig.draft
          const progress = item.target_amount > 0
            ? Math.min((item.collected_amount / item.target_amount) * 100, 100)
            : 0
          const isMenuOpen = menuOpenId === item.id

          return (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-500 overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => onEdit(item)}
            >
              {/* Top accent bar */}
              <div className={`h-1 w-full ${
                item.status === 'active' ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                : item.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                : 'bg-gradient-to-r from-slate-300 to-slate-400'
              }`} />

              {/* Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.color} mb-3`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-primary-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  {/* Action menu */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpenId(isMenuOpen ? null : item.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-44 animate-fadeInUp">
                          <button
                            onClick={() => { onEdit(item); setMenuOpenId(null) }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-blue-500" />
                            Düzenle
                          </button>
                          <button
                            onClick={() => window.open(`/ihtiyac/${item.slug}`, '_blank')}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                            Sayfada Gör
                          </button>
                          {onStatusChange && (
                            <>
                              <div className="border-t border-gray-100 my-1" />
                              {item.status !== 'active' && (
                                <button
                                  onClick={() => { onStatusChange(item.id, 'active'); setMenuOpenId(null) }}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  Aktif Yap
                                </button>
                              )}
                              {item.status !== 'completed' && (
                                <button
                                  onClick={() => { onStatusChange(item.id, 'completed'); setMenuOpenId(null) }}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                                  Tamamlandı
                                </button>
                              )}
                              {item.status !== 'draft' && (
                                <button
                                  onClick={() => { onStatusChange(item.id, 'draft'); setMenuOpenId(null) }}
                                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                                  Taslağa Al
                                </button>
                              )}
                            </>
                          )}
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => { onDelete(item.id); setMenuOpenId(null) }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-primary-500" />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">Fiyat</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">Toplanan</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.collected_amount)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-rose-500" />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">Bağışçı</p>
                    <p className="text-sm font-bold text-gray-900">{item.donor_count}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {item.target_amount > 0 && (
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>İlerleme</span>
                    <span className="font-semibold text-gray-700">%{progress.toFixed(0)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        progress >= 100 ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : progress >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        : progress >= 50 ? 'bg-gradient-to-r from-primary-400 to-primary-500'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                {item.payment_ref && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    {item.payment_ref}
                  </span>
                )}
                {!item.payment_ref && <span />}
                <span className="text-xs text-gray-400">#{item.sort_order}</span>
              </div>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/[0.02] transition-colors duration-300 pointer-events-none rounded-2xl" />
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === safePage
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
