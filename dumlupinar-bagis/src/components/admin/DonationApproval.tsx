import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Upload, Search } from 'lucide-react'
import { useDonations } from '../../hooks/useDonations'
import { supabase } from '../../lib/supabaseClient'
import { formatCurrency, formatRelativeTime } from '../../lib/formatters'
import type { Donation, DonationPaymentStatus } from '../../types/donation'

type FilterStatus = 'all' | DonationPaymentStatus

export default function DonationApproval() {
  const { donations, loading, confirmDonation, rejectDonation } = useDonations(true)
  const [filter, setFilter] = useState<FilterStatus>('pending')
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [receiptUploading, setReceiptUploading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = donations.filter((d) => {
    const matchesFilter = filter === 'all' || d.status === filter
    const matchesSearch = !search || (d.donor_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchesFilter && matchesSearch
  })

  const statusCounts = {
    pending: donations.filter((d) => d.status === 'pending').length,
    confirmed: donations.filter((d) => d.status === 'confirmed').length,
    rejected: donations.filter((d) => d.status === 'rejected').length,
  }

  const handleConfirm = async (id: string) => {
    setProcessing(id)
    try {
      await confirmDonation(id)
    } catch {
      // Error handling delegated to hook
    }
    setProcessing(null)
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      await rejectDonation(id)
    } catch {
      // Error handling delegated to hook
    }
    setProcessing(null)
  }

  const handleReceiptUpload = async (donationId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) return // 5MB max
    setReceiptUploading(donationId)

    const ext = file.name.split('.').pop()
    const path = `receipts/${donationId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('donation-images')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('donation-images')
        .getPublicUrl(path)

      await supabase
        .from('donations')
        .update({ receipt_url: urlData.publicUrl })
        .eq('id', donationId)
    }

    setReceiptUploading(null)
  }

  const statusBadge = (status: DonationPaymentStatus) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    const labels = {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      rejected: 'Reddedildi',
    }
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex gap-2">
          {(['all', 'pending', 'confirmed', 'rejected'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Tümü' : s === 'pending' ? `Bekleyen (${statusCounts.pending})` : s === 'confirmed' ? `Onaylı (${statusCounts.confirmed})` : `Red (${statusCounts.rejected})`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Bağışçı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Donation list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{filter === 'pending' ? 'Bekleyen bağış yok' : 'Sonuç bulunamadı'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((donation: Donation) => (
            <div
              key={donation.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-800 truncate">
                      {donation.donor_name || 'Anonim'}
                    </p>
                    {statusBadge(donation.status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-semibold text-primary-600">{formatCurrency(donation.amount)}</span>
                    <span>{formatRelativeTime(donation.created_at)}</span>
                    {donation.payment_ref && (
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{donation.payment_ref}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === donation.id ? null : donation.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Detay"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {donation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(donation.id)}
                        disabled={processing === donation.id}
                        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                        title="Onayla"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(donation.id)}
                        disabled={processing === donation.id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Reddet"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === donation.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                  {donation.donor_email && (
                    <p className="text-gray-600">E-posta: {donation.donor_email}</p>
                  )}
                  {donation.donor_phone && (
                    <p className="text-gray-600">Telefon: {donation.donor_phone}</p>
                  )}
                  {donation.notes && (
                    <p className="text-gray-600">Not: {donation.notes}</p>
                  )}
                  {donation.receipt_url && (
                    <a
                      href={donation.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Dekontu Görüntüle
                    </a>
                  )}

                  {/* Receipt upload */}
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">
                      {receiptUploading === donation.id ? 'Yükleniyor...' : 'Dekont Yükle'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleReceiptUpload(donation.id, file)
                      }}
                      disabled={receiptUploading === donation.id}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
