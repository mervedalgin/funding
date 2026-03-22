import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { Plus } from 'lucide-react'
import { useStudentNeeds } from '../../hooks/useStudentNeeds'
import type { StudentNeed, DonationStatus } from '../../types/donation'
import StatusFilter from '../../components/admin/StatusFilter'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import AdminToast from '../../components/admin/AdminToast'
import AdminLayout from '../../components/admin/AdminLayout'
import DonationModal from '../../components/DonationModal'
import EditPanel from '../../components/admin/EditPanel'

type FilterStatus = DonationStatus | 'all'

const StudentNeedCardGrid = lazy(() => import('../../components/admin/StudentNeedCardGrid'))
const StudentNeedForm = lazy(() => import('../../components/admin/StudentNeedForm'))

export default function Students() {
  const { items: studentItems, loading, createItem, updateItem, deleteItem } = useStudentNeeds(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<StudentNeed | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filteredItems = useMemo(() => {
    let result = studentItems
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) => i.title.toLowerCase().includes(q))
    }
    return result
  }, [studentItems, statusFilter, searchQuery])

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  const handleCreate = async (data: Partial<StudentNeed>) => {
    try {
      await createItem(data)
      setShowForm(false)
      showToast('Öğrenci ihtiyacı oluşturuldu', 'success')
    } catch { showToast('Oluşturulurken hata oluştu', 'error') }
  }

  const handleUpdate = async (data: Partial<StudentNeed>) => {
    if (!editingItem) return
    try {
      await updateItem(editingItem.id, data)
      setEditingItem(null)
      showToast('Öğrenci ihtiyacı güncellendi', 'success')
    } catch { showToast('Güncelleme sırasında hata oluştu', 'error') }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      await deleteItem(deleteId)
      setDeleteId(null)
      showToast('Öğrenci ihtiyacı silindi', 'success')
    } catch { showToast('Silme işlemi sırasında hata oluştu', 'error') }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateItem(id, { status } as Partial<StudentNeed>)
      showToast('Durum güncellendi', 'success')
    } catch { showToast('Durum güncellenirken hata oluştu', 'error') }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        }>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Öğrenci İhtiyaçları</h2>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors min-h-[44px] shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni Ekle
            </button>
          </div>

          <StatusFilter currentFilter={statusFilter} onFilterChange={setStatusFilter} onSearch={setSearchQuery} />

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <StudentNeedCardGrid
              items={filteredItems}
              onEdit={(item) => setEditingItem(item)}
              onDelete={(id) => setDeleteId(id)}
              onStatusChange={handleStatusChange}
            />
          )}

          <DonationModal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Öğrenci İhtiyacı">
            <StudentNeedForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </DonationModal>

          <EditPanel isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Öğrenci İhtiyacı Düzenle">
            <StudentNeedForm item={editingItem} onSubmit={handleUpdate} onCancel={() => setEditingItem(null)} />
          </EditPanel>

          <ConfirmDialog
            isOpen={!!deleteId}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteId(null)}
            title="Öğrenci İhtiyacını Sil"
            message="Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          />
        </Suspense>

        {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  )
}
