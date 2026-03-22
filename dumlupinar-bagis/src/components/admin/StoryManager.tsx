import { useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookHeart, GripVertical, ExternalLink, BarChart3 } from 'lucide-react'
import { useStories } from '../../hooks/useStories'
import type { DonationStory } from '../../types/donation'
import DonationModal from '../DonationModal'
import StoryForm from './StoryForm'
import ConfirmDialog from './ConfirmDialog'

export default function StoryManager() {
  const { items, loading, createItem, updateItem, deleteItem } = useStories(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<DonationStory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleCreate = async (data: Record<string, unknown>) => {
    try { await createItem(data as Partial<DonationStory>); setShowForm(false); showToast('Hikaye eklendi') }
    catch { showToast('Eklenirken hata oluştu') }
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return
    try { await updateItem(editingItem.id, data as Partial<DonationStory>); setEditingItem(null); showToast('Hikaye güncellendi') }
    catch { showToast('Güncellenirken hata oluştu') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteItem(deleteId); setDeleteId(null); showToast('Hikaye silindi') }
    catch { showToast('Silinirken hata oluştu') }
  }

  const togglePublished = async (item: DonationStory) => {
    try { await updateItem(item.id, { is_published: !item.is_published }); showToast(item.is_published ? 'Taslağa alındı' : 'Yayınlandı') }
    catch { showToast('Durum güncellenemedi') }
  }

  // Drag & drop
  const handleDragStart = (id: string) => setDragId(id)
  const handleDragEnter = (id: string) => { dragCounter.current++; setDragOverId(id) }
  const handleDragLeave = () => { dragCounter.current--; if (dragCounter.current <= 0) { setDragOverId(null); dragCounter.current = 0 } }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = async (targetId: string) => {
    setDragOverId(null); dragCounter.current = 0
    if (!dragId || dragId === targetId) { setDragId(null); return }
    const dragIndex = items.findIndex(i => i.id === dragId)
    const targetIndex = items.findIndex(i => i.id === targetId)
    if (dragIndex === -1 || targetIndex === -1) { setDragId(null); return }
    const reordered = [...items]; const [moved] = reordered.splice(dragIndex, 1); reordered.splice(targetIndex, 0, moved)
    try { await Promise.all(reordered.map((item, i) => updateItem(item.id, { sort_order: i }))); showToast('Sıralama güncellendi') }
    catch { showToast('Sıralama güncellenemedi') }
    setDragId(null)
  }
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); dragCounter.current = 0 }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Bağış Hikayeleri</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} hikaye — sürükleyerek sıralayın</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px] shadow-sm">
          <Plus className="w-4 h-4" /> Yeni Hikaye
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <BookHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Henüz hikaye eklenmemiş</p>
          <p className="text-gray-400 text-sm mt-1">"Yeni Hikaye" butonuyla başlayın</p>
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
                item.is_published ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
              } ${dragId === item.id ? 'opacity-40 scale-[0.98]' : ''} ${
                dragOverId === item.id && dragId !== item.id ? 'border-primary-400 bg-primary-50/50 shadow-md -translate-y-0.5' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="shrink-0 mt-1 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors" title="Sürükle">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold flex items-center justify-center">{index + 1}</div>

                {/* Thumbnail */}
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt={item.title} className="shrink-0 w-16 h-12 rounded-lg object-cover border border-gray-100" />
                ) : (
                  <div className="shrink-0 w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <BookHeart className="w-5 h-5 text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.summary || 'Özet yok'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status badge */}
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${
                        item.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.is_published ? 'Yayında' : 'Taslak'}
                      </span>

                      {/* View count */}
                      <span className="flex items-center gap-1 text-xs text-gray-400" title="Görüntülenme">
                        <BarChart3 className="w-3 h-3" /> {item.view_count}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-md">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingItem(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Düzenle
                    </button>
                    <button onClick={() => togglePublished(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        item.is_published ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}>
                      {item.is_published ? <><EyeOff className="w-3.5 h-3.5" /> Taslağa Al</> : <><Eye className="w-3.5 h-3.5" /> Yayınla</>}
                    </button>
                    {item.is_published && (
                      <a href={`/bagis-hikayeleri/${item.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Görüntüle
                      </a>
                    )}
                    <button onClick={() => setDeleteId(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DonationModal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Bağış Hikayesi">
        <StoryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </DonationModal>

      <DonationModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Hikayeyi Düzenle">
        <StoryForm item={editingItem} onSubmit={handleUpdate} onCancel={() => setEditingItem(null)} />
      </DonationModal>

      <ConfirmDialog isOpen={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)}
        title="Hikayeyi Sil" message="Bu hikayeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slideInUp">
          {toast}
        </div>
      )}
    </div>
  )
}
