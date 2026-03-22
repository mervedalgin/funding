import { useState, useMemo } from 'react'
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DonationItem } from '../../types/donation'

interface ItemTableProps {
  items: DonationItem[]
  onEdit: (item: DonationItem) => void
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
}

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  draft: 'Taslak',
  completed: 'Tamamlandı',
}

const statusColors: Record<string, string> = {
  active: 'bg-primary-100 text-primary-700',
  draft: 'bg-gray-100 text-gray-600',
  completed: 'bg-blue-100 text-blue-700',
}

type SortKey = 'title' | 'price' | 'collected_amount' | 'target_amount' | 'donor_count'
type SortDir = 'asc' | 'desc'

const ITEMS_PER_PAGE = 10

export default function ItemTable({ items, onEdit, onDelete, onStatusChange }: ItemTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Sorting
  const sortedItems = useMemo(() => {
    if (!sortKey) return items
    return [...items].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal, 'tr') : bVal.localeCompare(aVal, 'tr')
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [items, sortKey, sortDir])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedItems = sortedItems.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  // Reset page when items change significantly
  useMemo(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [items.length, totalPages, currentPage])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronsUpDown className="w-3 h-3 text-gray-400" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-gray-700" />
      : <ChevronDown className="w-3 h-3 text-gray-700" />
  }

  if (items.length === 0) {
    return <p className="text-gray-500 text-center py-8">Henüz kayıt yok.</p>
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="sm:hidden divide-y divide-gray-100">
        {paginatedItems.map((item) => (
          <div key={item.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">₺{item.price.toLocaleString('tr-TR')}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                {statusLabels[item.status]}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Hedef: ₺{item.target_amount.toLocaleString('tr-TR')} | Toplanan: ₺{item.collected_amount.toLocaleString('tr-TR')} | Bağışçı: {item.donor_count}
            </div>
            {onStatusChange && (
              <select
                value={item.status}
                onChange={(e) => onStatusChange(item.id, e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-base"
              >
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
              </select>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 flex items-center justify-center gap-1.5 p-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium min-h-[44px]"
              >
                <Pencil className="w-4 h-4" /> Düzenle
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex-1 flex items-center justify-center gap-1.5 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" /> Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">
                <button onClick={() => handleSort('title')} className="inline-flex items-center gap-1 hover:text-gray-900">
                  Başlık <SortIcon column="title" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => handleSort('price')} className="inline-flex items-center gap-1 hover:text-gray-900">
                  Fiyat <SortIcon column="price" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => handleSort('target_amount')} className="inline-flex items-center gap-1 hover:text-gray-900">
                  Hedef <SortIcon column="target_amount" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => handleSort('collected_amount')} className="inline-flex items-center gap-1 hover:text-gray-900">
                  Toplanan <SortIcon column="collected_amount" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => handleSort('donor_count')} className="inline-flex items-center gap-1 hover:text-gray-900">
                  Bağışçı <SortIcon column="donor_count" />
                </button>
              </th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{item.sort_order}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                <td className="px-4 py-3">₺{item.price.toLocaleString('tr-TR')}</td>
                <td className="px-4 py-3">₺{item.target_amount.toLocaleString('tr-TR')}</td>
                <td className="px-4 py-3">₺{item.collected_amount.toLocaleString('tr-TR')}</td>
                <td className="px-4 py-3">{item.donor_count}</td>
                <td className="px-4 py-3">
                  {onStatusChange ? (
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[item.status]} text-base`}
                    >
                      <option value="draft">Taslak</option>
                      <option value="active">Aktif</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Düzenle"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {sortedItems.length} kayıttan {(safePage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safePage * ITEMS_PER_PAGE, sortedItems.length)} arası
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${
                  page === safePage
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
