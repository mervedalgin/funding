import { useState, useCallback, useRef } from 'react'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Scale, GripVertical, ExternalLink,
  FileText, BookOpen, ShieldCheck, Landmark, Gavel, ScrollText, BadgeCheck, Building2, FileCheck,
} from 'lucide-react'
import { useLegalBasis } from '../../hooks/useLegalBasis'
import type { LegalBasisItem } from '../../types/donation'
import DonationModal from '../DonationModal'
import LegalBasisForm from './LegalBasisForm'
import ConfirmDialog from './ConfirmDialog'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  'scale': Scale,
  'file-text': FileText,
  'book-open': BookOpen,
  'shield-check': ShieldCheck,
  'landmark': Landmark,
  'gavel': Gavel,
  'scroll-text': ScrollText,
  'badge-check': BadgeCheck,
  'building-2': Building2,
  'file-check': FileCheck,
}

export { ICON_MAP }

export default function LegalBasisManager() {
  const { items, loading, createItem, updateItem, deleteItem } = useLegalBasis(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<LegalBasisItem | null>(null)
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
      await createItem(data as Partial<LegalBasisItem>)
      setShowForm(false)
      showToast('Yasal dayanak eklendi')
    } catch {
      showToast('Eklenirken hata oluştu')
    }
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return
    try {
      await updateItem(editingItem.id, data as Partial<LegalBasisItem>)
      setEditingItem(null)
      showToast('Yasal dayanak güncellendi')
    } catch {
      showToast('Güncellenirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteItem(deleteId)
      setDeleteId(null)
      showToast('Yasal dayanak silindi')
    } catch {
      showToast('Silinirken hata oluştu')
    }
  }

  const toggleActive = async (item: LegalBasisItem) => {
    try {
      await updateItem(item.id, { is_active: !item.is_active })
      showToast(item.is_active ? 'Madde gizlendi' : 'Madde aktifleştirildi')
    } catch {
      showToast('Durum güncellenemedi')
    }
  }

  // Drag & drop handlers
  const handleDragStart = (id: string) => setDragId(id)
  const handleDragEnter = (id: string) => { dragCounter.current++; setDragOverId(id) }
  const handleDragLeave = () => { dragCounter.current--; if (dragCounter.current <= 0) { setDragOverId(null); dragCounter.current = 0 } }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = async (targetId: string) => {
    setDragOverId(null)
    dragCounter.current = 0

    if (!dragId || dragId === targetId) { setDragId(null); return }

    const dragIndex = items.findIndex(i => i.id === dragId)
    const targetIndex = items.findIndex(i => i.id === targetId)
    if (dragIndex === -1 || targetIndex === -1) { setDragId(null); return }

    const reordered = [...items]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    try {
      await Promise.all(reordered.map((item, i) => updateItem(item.id, { sort_order: i })))
      showToast('Sıralama güncellendi')
    } catch {
      showToast('Sıralama güncellenemedi')
    }
    setDragId(null)
  }

  const handleDragEnd = () => { setDragId(null); setDragOverId(null); dragCounter.current = 0 }

  const getIcon = (name: string) => ICON_MAP[name] || Scale

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
          <h2 className="text-lg font-bold text-gray-800">Yasal Dayanak</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} madde kayıtlı — sıralamayı sürükleyerek değiştirin</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px] shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Madde
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Scale className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Henüz yasal dayanak eklenmemiş</p>
          <p className="text-gray-400 text-sm mt-1">"Yeni Madde" butonuyla başlayın</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const IconComp = getIcon(item.icon_name)
            return (
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
                  <div className="shrink-0 mt-1 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors" title="Sürükleyerek sıralayın">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <IconComp className="w-4 h-4 text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]+>/g, ' ').slice(0, 150) }} />
                      </div>

                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-primary-500 hover:text-primary-700" title="Harici link">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingItem(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Düzenle
                      </button>
                      <button
                        onClick={() => toggleActive(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          item.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {item.is_active ? <><EyeOff className="w-3.5 h-3.5" /> Gizle</> : <><Eye className="w-3.5 h-3.5" /> Aktifleştir</>}
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DonationModal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Yasal Dayanak Ekle">
        <LegalBasisForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </DonationModal>

      <DonationModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Yasal Dayanağı Düzenle">
        <LegalBasisForm item={editingItem} onSubmit={handleUpdate} onCancel={() => setEditingItem(null)} />
      </DonationModal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Yasal Dayanağı Sil"
        message="Bu maddeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slideInUp">
          {toast}
        </div>
      )}
    </div>
  )
}
