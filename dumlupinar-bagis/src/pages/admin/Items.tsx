import { useState, useMemo, useCallback } from 'react'
import { Plus, Download, ChevronDown, CreditCard, FileDown, Clock, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useDonationItems } from '../../hooks/useDonationItems'
import type { DonationItem, DonationStatus } from '../../types/donation'
import ItemCardGrid from '../../components/admin/ItemCardGrid'
import ItemForm from '../../components/admin/ItemForm'
import StatusFilter from '../../components/admin/StatusFilter'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import AdminToast from '../../components/admin/AdminToast'
import AdminLayout from '../../components/admin/AdminLayout'
import DonationModal from '../../components/DonationModal'
import EditPanel from '../../components/admin/EditPanel'
import { exportToCsv, formatRelativeTime } from '../../lib/formatters'
import { Link } from 'react-router-dom'

type FilterStatus = DonationStatus | 'all'

const PIE_COLORS = ['#0d9488', '#9ca3af', '#3b82f6']
const STATUS_LABELS: Record<string, string> = { active: 'Aktif', draft: 'Taslak', completed: 'Tamamlandı' }

export default function Items() {
  const { items, loading, createItem, updateItem, deleteItem } = useDonationItems(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<DonationItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [chartsOpen, setChartsOpen] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    let result = items
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) => i.title.toLowerCase().includes(q))
    }
    return result
  }, [items, statusFilter, searchQuery])

  const recentItems = useMemo(() =>
    [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    [items]
  )

  const barChartData = useMemo(() =>
    items.filter((i) => i.target_amount > 0).slice(0, 10).map((i) => ({
      name: i.title.length > 15 ? i.title.slice(0, 15) + '...' : i.title,
      Hedef: i.target_amount,
      Toplanan: i.collected_amount,
    })),
    [items]
  )

  const pieChartData = useMemo(() => {
    const counts = { active: 0, draft: 0, completed: 0 }
    items.forEach((i) => { counts[i.status]++ })
    return Object.entries(counts).filter(([, v]) => v > 0).map(([key, value]) => ({ name: STATUS_LABELS[key], value }))
  }, [items])

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  const handleCreate = async (data: Partial<DonationItem>) => {
    try { await createItem(data); setShowForm(false); showToast('Kalem başarıyla oluşturuldu', 'success') }
    catch { showToast('Kalem oluşturulurken hata oluştu', 'error') }
  }

  const handleUpdate = async (data: Partial<DonationItem>) => {
    if (!editingItem) return
    try { await updateItem(editingItem.id, data); setEditingItem(null); showToast('Kalem başarıyla güncellendi', 'success') }
    catch { showToast('Güncelleme sırasında hata oluştu', 'error') }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try { await deleteItem(deleteId); setDeleteId(null); showToast('Kalem başarıyla silindi', 'success') }
    catch { showToast('Silme işlemi sırasında hata oluştu', 'error') }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateItem(id, { status } as Partial<DonationItem>); showToast('Durum güncellendi', 'success') }
    catch { showToast('Durum güncellenirken hata oluştu', 'error') }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Hızlı Eylemler</h2>
            <div className="space-y-2">
              <button onClick={() => setShowForm(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 min-h-[44px] group">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors"><Plus className="w-4 h-4 text-primary-600" /></div>
                Yeni Kalem Ekle
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
              </button>
              <Link to="/admin/payment-channels" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 min-h-[44px] group">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors"><CreditCard className="w-4 h-4 text-amber-600" /></div>
                Ödeme Kanalları
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
              </Link>
              <button onClick={() => exportToCsv(filteredItems)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 min-h-[44px] group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors"><FileDown className="w-4 h-4 text-blue-600" /></div>
                CSV İndir
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />Son Aktiviteler</h2>
            {recentItems.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">Henüz aktivite yok</p>
            ) : (
              <div className="space-y-1">
                {recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setEditingItem(item)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'active' ? 'bg-primary-500' : item.status === 'draft' ? 'bg-gray-300' : 'bg-blue-500'}`} />
                      <p className="text-sm text-gray-700 truncate font-medium">{item.title}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{formatRelativeTime(item.updated_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <button onClick={() => setChartsOpen(!chartsOpen)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <h2 className="text-sm font-semibold text-gray-700">Grafikler & Analitik</h2>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${chartsOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${chartsOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {barChartData.length > 0 && (
                  <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hedef vs Toplanan (₺)</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGradientHedef" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.9} /><stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.4} /></linearGradient>
                          <linearGradient id="barGradientToplanan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity={0.9} /><stop offset="100%" stopColor="#0d9488" stopOpacity={0.4} /></linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} angle={-20} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '13px' }} />
                        <Bar dataKey="Hedef" fill="url(#barGradientHedef)" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out" />
                        <Bar dataKey="Toplanan" fill="url(#barGradientToplanan)" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pieChartData.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Durum Dağılımı</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} animationDuration={1200} animationEasing="ease-out" stroke="none">
                          {pieChartData.map((_, idx) => (<Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <StatusFilter currentFilter={statusFilter} onFilterChange={setStatusFilter} onSearch={setSearchQuery} />
          <div className="flex items-center gap-2">
            <button onClick={() => exportToCsv(filteredItems)} className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" title="CSV İndir">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px] shadow-sm">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Yeni Ekle</span>
            </button>
          </div>
        </div>

        {/* Item Cards */}
        {loading ? (
          <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : (
          <ItemCardGrid items={filteredItems} onEdit={(item) => setEditingItem(item)} onDelete={(id) => setDeleteId(id)} onStatusChange={handleStatusChange} />
        )}

        <DonationModal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Bağış Kalemi">
          <ItemForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DonationModal>

        <EditPanel isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Bağış Kalemi Düzenle">
          <ItemForm item={editingItem} onSubmit={handleUpdate} onCancel={() => setEditingItem(null)} />
        </EditPanel>

        <ConfirmDialog isOpen={!!deleteId} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} title="Kaydı Sil" message="Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz." />
        {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  )
}
