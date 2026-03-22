import type { DonationItem } from '../types/donation'

/**
 * Formats a number as Turkish Lira currency string.
 * Example: 25000 -> "₺25.000"
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `₺${formatted}`
}

/**
 * Returns a Turkish relative time string for a given ISO date string.
 * Example: "2 saat önce", "3 gün önce"
 */
export function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffSeconds = Math.floor((now - then) / 1000)

  if (diffSeconds < 60) {
    return 'az önce'
  }

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} saat önce`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays} gün önce`
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) {
    return `${diffMonths} ay önce`
  }

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears} yıl önce`
}

/**
 * Generates a CSV file from donation items and triggers a browser download.
 */
export function exportToCsv(items: DonationItem[]): void {
  const headers = [
    'Başlık',
    'Durum',
    'Hedef Tutar',
    'Toplanan Tutar',
    'Bağışçı Sayısı',
    'Oluşturma Tarihi',
  ]

  const rows = items.map((item) => [
    `"${item.title.replace(/"/g, '""')}"`,
    item.status,
    item.target_amount.toString(),
    item.collected_amount.toString(),
    item.donor_count.toString(),
    item.created_at,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `bagis-kalemleri-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
