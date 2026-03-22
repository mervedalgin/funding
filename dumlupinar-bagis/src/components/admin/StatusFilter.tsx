import { Search } from 'lucide-react'
import type { DonationStatus } from '../../types/donation'

type FilterValue = DonationStatus | 'all'

interface StatusFilterProps {
  currentFilter: FilterValue
  onFilterChange: (filter: FilterValue) => void
  onSearch: (query: string) => void
}

const filters: { label: string; value: FilterValue }[] = [
  { label: 'Tümü', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Taslak', value: 'draft' },
  { label: 'Tamamlandı', value: 'completed' },
]

export default function StatusFilter({
  currentFilter,
  onFilterChange,
  onSearch,
}: StatusFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Ara..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              currentFilter === filter.value
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
