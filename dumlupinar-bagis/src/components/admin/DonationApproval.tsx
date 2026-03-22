import { useState, useMemo, useCallback, useRef } from 'react'
import {
  CheckCircle, XCircle, Clock, Eye, Search, Download, Filter,
  ChevronDown, ChevronUp, Upload, Users, TrendingUp, Banknote,
  CreditCard, Landmark, AlertTriangle, X as XIcon, FileText, Loader2,
  Package, GraduationCap, ExternalLink, StickyNote,
} from 'lucide-react'
import { useDonations, computeStats } from '../../hooks/useDonations'
import type { UnifiedDonation } from '../../hooks/useDonations'
import { supabase } from '../../lib/supabaseClient'
import { formatCurrency, formatRelativeTime } from '../../lib/formatters'
import { uploadImage } from '../../lib/storage'
import EditPanel from './EditPanel'

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'rejected'
type DonationTab = 'all' | 'school' | 'student'
type SortField = 'created_at' | 'amount' | 'donor_name'

const REJECT_REASONS = [
  'Dekont eksik',
  'Tutar uyuşmuyor',
  'Referans kodu hatalı',
  'Spam / Sahte',
  'Mükerrer kayıt',
  'Diğer',
]

const STATUS_CONFIG = {
  pending: { label: 'Bekleyen', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Onaylanan', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  rejected: { label: 'Reddedilen', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
}

export default function DonationApproval() {
  const {
    allDonations, loading, fetchDonations,
    confirmDonation, rejectDonation, updateDonationNotes,
    bulkConfirm, bulkReject,
  } = useDonations(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending')
  const [typeFilter, setTypeFilter] = useState<DonationTab>('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail panel
  const [detailItem, setDetailItem] = useState<UnifiedDonation | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<{ id: string; table: 'donations' | 'student_donations' } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)

  // Receipt upload
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  // Processing
  const [processing, setProcessing] = useState<string | null>(null)

  // Toast
  const [toast, setToast] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }, [])

  // Stats
  const stats = useMemo(() => computeStats(allDonations), [allDonations])

  // Filtered + sorted
  const filtered = useMemo(() => {
    let result = allDonations

    if (statusFilter !== 'all') result = result.filter(d => d.status === statusFilter)
    if (typeFilter !== 'all') result = result.filter(d => d.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.donor_name?.toLowerCase().includes(q) ||
        d.donor_email?.toLowerCase().includes(q) ||
        d.payment_ref?.toLowerCase().includes(q) ||
        d.notes?.toLowerCase().includes(q)
      )
    }
    if (dateFrom) result = result.filter(d => d.created_at >= dateFrom)
    if (dateTo) result = result.filter(d => d.created_at <= dateTo + 'T23:59:59')

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'amount') cmp = a.amount - b.amount
      else if (sortField === 'donor_name') cmp = (a.donor_name || '').localeCompare(b.donor_name || '')
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [allDonations, statusFilter, typeFilter, search, dateFrom, dateTo, sortField, sortAsc])

  const getTable = (d: UnifiedDonation) => d.type === 'student' ? 'student_donations' as const : 'donations' as const

  // Handlers
  const handleConfirm = async (d: UnifiedDonation) => {
    setProcessing(d.id)
    try { await confirmDonation(d.id, getTable(d)); showToast('Bağış onaylandı') }
    catch { showToast('Onaylama hatası') }
    setProcessing(null)
  }

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return
    const reason = [rejectReason, rejectNote].filter(Boolean).join(': ')
    try { await rejectDonation(rejectTarget.id, rejectTarget.table, reason); showToast('Bağış reddedildi') }
    catch { showToast('Reddetme hatası') }
    setRejectTarget(null); setRejectReason(''); setRejectNote('')
  }

  const handleBulkConfirm = async () => {
    const items = filtered.filter(d => selectedIds.has(d.id) && d.status === 'pending').map(d => ({ id: d.id, table: getTable(d) }))
    if (items.length === 0) return
    setProcessing('bulk')
    try { await bulkConfirm(items); showToast(`${items.length} bağış onaylandı`); setSelectedIds(new Set()) }
    catch { showToast('Toplu onaylama hatası') }
    setProcessing(null)
  }

  const handleBulkRejectSubmit = async () => {
    const items = filtered.filter(d => selectedIds.has(d.id) && d.status === 'pending').map(d => ({ id: d.id, table: getTable(d) }))
    if (items.length === 0) return
    const reason = [rejectReason, rejectNote].filter(Boolean).join(': ')
    try { await bulkReject(items, reason); showToast(`${items.length} bağış reddedildi`); setSelectedIds(new Set()) }
    catch { showToast('Toplu reddetme hatası') }
    setBulkRejectOpen(false); setRejectReason(''); setRejectNote('')
  }

  const handleSaveNote = async () => {
    if (!detailItem) return
    setSavingNote(true)
    try { await updateDonationNotes(detailItem.id, getTable(detailItem), noteText); showToast('Not kaydedildi') }
    catch { showToast('Not kaydedilemedi') }
    setSavingNote(false)
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !detailItem) return
    setUploadingReceipt(true)
    try {
      const url = await uploadImage(file)
      await supabase.from(getTable(detailItem)).update({ receipt_url: url }).eq('id', detailItem.id)
      await fetchDonations()
      showToast('Dekont yüklendi')
    } catch { showToast('Dekont yüklenemedi') }
    setUploadingReceipt(false)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(d => d.id)))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(false) }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    sortField === field ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-30" />
  )

  // CSV Export
  const exportCsv = () => {
    const headers = ['Tarih', 'Bağışçı', 'Tutar', 'Tür', 'Durum', 'Ödeme', 'Referans', 'Not']
    const rows = filtered.map(d => [
      new Date(d.created_at).toLocaleDateString('tr-TR'),
      d.donor_name || 'Anonim',
      d.amount.toString(),
      d.type === 'student' ? 'Öğrenci' : 'Okul',
      d.status,
      d.payment_method,
      d.payment_ref || '',
      (d.notes || '').replace(/"/g, '""'),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `bagislar_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const pendingSelected = filtered.filter(d => selectedIds.has(d.id) && d.status === 'pending').length

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium text-amber-600 uppercase">Bekleyen</span></div>
          <p className="text-2xl font-bold text-gray-800">{stats.pending.count}</p>
          <p className="text-xs text-gray-400">{formatCurrency(stats.pending.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-xs font-medium text-green-600 uppercase">Bu Ay</span></div>
          <p className="text-2xl font-bold text-gray-800">{stats.confirmedThisMonth.count}</p>
          <p className="text-xs text-gray-400">{formatCurrency(stats.confirmedThisMonth.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-primary-100 p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-primary-500" /><span className="text-xs font-medium text-primary-600 uppercase">Toplam</span></div>
          <p className="text-2xl font-bold text-gray-800">{stats.confirmedAll.count}</p>
          <p className="text-xs text-gray-400">{formatCurrency(stats.confirmedAll.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-1"><Banknote className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-blue-600 uppercase">Ortalama</span></div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.averageDonation)}</p>
        </div>
        <div className="bg-white rounded-xl border border-violet-100 p-4">
          <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-violet-500" /><span className="text-xs font-medium text-violet-600 uppercase">Onay Oranı</span></div>
          <p className="text-2xl font-bold text-gray-800">%{stats.approvalRate.toFixed(0)}</p>
        </div>
      </div>

      {/* Type tabs + Actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'school', 'student'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === t ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'all' ? 'Tümü' : t === 'school' ? 'Okul' : 'Öğrenci'}
              <span className="ml-1 text-xs text-gray-400">
                ({allDonations.filter(d => t === 'all' || d.type === t).length})
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Filtreler {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button onClick={exportCsv} className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors" title="CSV İndir">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'rejected'] as const).map(s => {
          const count = s === 'all' ? allDonations.length : allDonations.filter(d => d.status === s).length
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === s ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
              {s === 'all' ? 'Tümü' : STATUS_CONFIG[s].label}
              <span className={`ml-1.5 text-xs ${statusFilter === s ? 'text-primary-200' : 'text-gray-400'}`}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeInUp">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Arama</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, email, referans..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Başlangıç</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Bitiş</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div className="flex items-end">
            <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setStatusFilter('pending'); setTypeFilter('all') }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Temizle</button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex items-center justify-between animate-fadeInUp">
          <span className="text-sm font-medium text-primary-700">{selectedIds.size} bağış seçildi {pendingSelected > 0 && `(${pendingSelected} bekleyen)`}</span>
          <div className="flex items-center gap-2">
            {pendingSelected > 0 && (
              <>
                <button onClick={handleBulkConfirm} disabled={processing === 'bulk'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50">
                  {processing === 'bulk' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Onayla
                </button>
                <button onClick={() => setBulkRejectOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors">
                  <XCircle className="w-3 h-3" /> Reddet
                </button>
              </>
            )}
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-primary-600 hover:underline ml-2">Seçimi Kaldır</button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Banknote className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Bağış bulunamadı</p>
          <p className="text-gray-400 text-sm mt-1">Filtreleri değiştirmeyi deneyin</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort('donor_name')}>
                    <span className="inline-flex items-center gap-1">Bağışçı <SortIcon field="donor_name" /></span>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort('amount')}>
                    <span className="inline-flex items-center gap-1">Tutar <SortIcon field="amount" /></span>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tür</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ödeme</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort('created_at')}>
                    <span className="inline-flex items-center gap-1">Tarih <SortIcon field="created_at" /></span>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(d => {
                  const sc = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG]
                  return (
                    <tr key={`${d.type}-${d.id}`} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleSelect(d.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setDetailItem(d); setNoteText(d.notes || '') }} className="text-left hover:text-primary-600 transition-colors">
                          <p className="font-medium text-gray-800">{d.donor_name || <span className="text-gray-400 italic">Anonim</span>}</p>
                          {d.payment_ref && <p className="text-[10px] font-mono text-gray-400 mt-0.5">{d.payment_ref}</p>}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(d.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${d.type === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary-50 text-primary-600'}`}>
                          {d.type === 'student' ? <><GraduationCap className="w-3 h-3" /> Öğrenci</> : <><Package className="w-3 h-3" /> Okul</>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          {d.payment_method === 'bank_transfer' ? <Landmark className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                          {d.payment_method === 'bank_transfer' ? 'Havale' : 'Online'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border ${sc?.color || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {sc && <sc.icon className="w-3 h-3" />} {sc?.label || d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatRelativeTime(d.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setDetailItem(d); setNoteText(d.notes || '') }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detay">
                            <Eye className="w-4 h-4" />
                          </button>
                          {d.status === 'pending' && (
                            <>
                              <button onClick={() => handleConfirm(d)} disabled={processing === d.id} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Onayla">
                                {processing === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setRejectTarget({ id: d.id, table: getTable(d) })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reddet">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length} sonuç gösteriliyor
          </div>
        </div>
      )}

      {/* Detail Panel */}
      <EditPanel isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="Bağış Detayı">
        {detailItem && (
          <div className="space-y-6">
            {/* Donor info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Bağışçı Bilgileri</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Ad</span><span className="font-medium text-gray-800">{detailItem.donor_name || 'Anonim'}</span></div>
                {detailItem.donor_email && <div className="flex justify-between text-sm"><span className="text-gray-500">E-posta</span><span className="text-gray-800">{detailItem.donor_email}</span></div>}
                {detailItem.donor_phone && <div className="flex justify-between text-sm"><span className="text-gray-500">Telefon</span><span className="text-gray-800">{detailItem.donor_phone}</span></div>}
              </div>
            </div>

            {/* Donation info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Bağış Detayı</h3>
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary-700">{formatCurrency(detailItem.amount)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tür</span><span className="font-medium">{detailItem.type === 'student' ? 'Öğrenci İhtiyacı' : 'Okul İhtiyacı'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Ödeme</span><span>{detailItem.payment_method === 'bank_transfer' ? 'Havale/EFT' : 'Online'}</span></div>
                {detailItem.payment_ref && <div className="flex justify-between text-sm"><span className="text-gray-500">Referans</span><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{detailItem.payment_ref}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tarih</span><span>{new Date(detailItem.created_at).toLocaleString('tr-TR')}</span></div>
                {detailItem.confirmed_at && <div className="flex justify-between text-sm"><span className="text-gray-500">Onay Tarihi</span><span>{new Date(detailItem.confirmed_at).toLocaleString('tr-TR')}</span></div>}
              </div>
            </div>

            {/* Linked item */}
            {detailItem.item_id && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Bağlantılı Kalem</h3>
                <a href={detailItem.type === 'student' ? `/student-need/${detailItem.item_id}` : `/item/${detailItem.item_id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                  <ExternalLink className="w-4 h-4" /> Kalemi Görüntüle
                </a>
              </div>
            )}

            {/* Receipt */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Dekont</h3>
              {detailItem.receipt_url ? (
                <a href={detailItem.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <FileText className="w-4 h-4" /> Dekontu Görüntüle
                </a>
              ) : (
                <p className="text-xs text-gray-400">Dekont yüklenmemiş</p>
              )}
              <button onClick={() => receiptInputRef.current?.click()} disabled={uploadingReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                {uploadingReceipt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {uploadingReceipt ? 'Yükleniyor...' : 'Dekont Yükle'}
              </button>
              <input ref={receiptInputRef} type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Admin Notları</h3>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="Not ekleyin..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none" />
              <button onClick={handleSaveNote} disabled={savingNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors">
                {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <StickyNote className="w-3 h-3" />} Notu Kaydet
              </button>
            </div>

            {/* Quick actions */}
            {detailItem.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button onClick={() => handleConfirm(detailItem)} disabled={processing === detailItem.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors min-h-[44px]">
                  {processing === detailItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Onayla
                </button>
                <button onClick={() => { setRejectTarget({ id: detailItem.id, table: getTable(detailItem) }); setDetailItem(null) }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors min-h-[44px]">
                  <XCircle className="w-4 h-4" /> Reddet
                </button>
              </div>
            )}

            {/* Status */}
            <div className="text-center pt-2">
              {(() => {
                const sc = STATUS_CONFIG[detailItem.status as keyof typeof STATUS_CONFIG]
                return sc ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${sc.color}`}>
                    <sc.icon className="w-4 h-4" /> {sc.label}
                  </span>
                ) : null
              })()}
            </div>
          </div>
        )}
      </EditPanel>

      {/* Reject Modal */}
      {(rejectTarget || bulkRejectOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setRejectTarget(null); setBulkRejectOpen(false) }} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fadeInUp space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-800">{bulkRejectOpen ? `${pendingSelected} Bağışı Reddet` : 'Bağışı Reddet'}</h3>
              </div>
              <button onClick={() => { setRejectTarget(null); setBulkRejectOpen(false) }} className="p-1.5 hover:bg-gray-100 rounded-lg"><XIcon className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Reddetme Nedeni</label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400">
                <option value="">Neden seçin...</option>
                {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ek Not (opsiyonel)</label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={2} placeholder="Ek açıklama..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={bulkRejectOpen ? handleBulkRejectSubmit : handleRejectSubmit} disabled={!rejectReason}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors min-h-[44px]">
                Reddet
              </button>
              <button onClick={() => { setRejectTarget(null); setBulkRejectOpen(false); setRejectReason(''); setRejectNote('') }}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slideInUp">
          {toast}
        </div>
      )}
    </div>
  )
}
