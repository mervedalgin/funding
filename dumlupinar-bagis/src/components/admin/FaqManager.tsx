import { useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, MessageCircle, GripVertical } from 'lucide-react'
import { useFaq } from '../../hooks/useFaq'
import type { FaqItem } from '../../types/donation'
import DonationModal from '../DonationModal'
import FaqForm, { FAQ_CATEGORIES } from './FaqForm'
import ConfirmDialog from './ConfirmDialog'

export default function FaqManager() {
  const { items, loading, createItem, updateItem, deleteItem } = useFaq(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createItem(data as Partial<FaqItem>)
      setShowForm(false)
      showToast('Soru eklendi')
    } catch {
      showToast('Eklenirken hata oluştu')
    }
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return
    try {
      await updateItem(editingItem.id, data as Partial<FaqItem>)
      setEditingItem(null)
      showToast('Soru güncellendi')
    } catch {
      showToast('Güncellenirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteItem(deleteId)
      setDeleteId(null)
      showToast('Soru silindi')
    } catch {
      showToast('Silinirken hata oluştu')
    }
  }

  const toggleActive = async (item: FaqItem) => {
    try {
      await updateItem(item.id, { is_active: !item.is_active })
      showToast(item.is_active ? 'Soru gizlendi' : 'Soru aktifleştirildi')
    } catch {
      showToast('Durum güncellenemedi')
    }
  }

  // Drag & drop handlers
  const handleDragStart = (id: string) => {
    setDragId(id)
  }

  const handleDragEnter = (id: string) => {
    dragCounter.current++
    setDragOverId(id)
  }

  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current <= 0) {
      setDragOverId(null)
      dragCounter.current = 0
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: string) => {
    setDragOverId(null)
    dragCounter.current = 0

    if (!dragId || dragId === targetId) {
      setDragId(null)
      return
    }

    const dragIndex = items.findIndex(i => i.id === dragId)
    const targetIndex = items.findIndex(i => i.id === targetId)

    if (dragIndex === -1 || targetIndex === -1) {
      setDragId(null)
      return
    }

    // Reorder: update sort_order for affected items
    const reordered = [...items]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    // Batch update sort_order
    try {
      const updates = reordered.map((item, i) => updateItem(item.id, { sort_order: i }))
      await Promise.all(updates)
      showToast('Sıralama güncellendi')
    } catch {
      showToast('Sıralama güncellenemedi')
    }

    setDragId(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverId(null)
    dragCounter.current = 0
  }

  const getCategoryLabel = (value: string) => {
    return FAQ_CATEGORIES.find(c => c.value === value)?.label || value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Sıkça Sorulan Sorular</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} soru kayıtlı — sıralamayı sürükleyerek değiştirin</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px] shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Soru
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Henüz soru eklenmemiş</p>
          <p className="text-gray-400 text-sm mt-1">"Yeni Soru" butonuyla başlayın</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnter={() => handleDragEnter(item.id)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={handleDragEnd}
              className={`group bg-white rounded-xl border transition-all duration-200 ${
                item.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
              } ${
                dragId === item.id ? 'opacity-40 scale-[0.98] shadow-inner' : ''
              } ${
                dragOverId === item.id && dragId !== item.id
                  ? 'border-primary-400 bg-primary-50/50 shadow-md -translate-y-0.5'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                {/* Drag handle */}
                <div
                  className="shrink-0 mt-1 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors"
                  title="Sürükleyerek sıralayın"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order number */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.question}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.answer}</p>
                    </div>

                    {/* Category badge */}
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => toggleActive(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        item.is_active
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {item.is_active ? (
                        <><EyeOff className="w-3.5 h-3.5" /> Gizle</>
                      ) : (
                        <><Eye className="w-3.5 h-3.5" /> Aktifleştir</>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <DonationModal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Soru Ekle">
        <FaqForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </DonationModal>

      {/* Edit modal */}
      <DonationModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Soruyu Düzenle">
        <FaqForm item={editingItem} onSubmit={handleUpdate} onCancel={() => setEditingItem(null)} />
      </DonationModal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Soruyu Sil"
        message="Bu soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slideInUp">
          {toast}
        </div>
      )}
    </div>
  )
}
