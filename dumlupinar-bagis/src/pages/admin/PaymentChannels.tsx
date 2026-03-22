import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { usePaymentChannels } from '../../hooks/usePaymentChannels'
import type { PaymentChannel } from '../../types/donation'
import DonationModal from '../../components/DonationModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import AdminToast from '../../components/admin/AdminToast'
import AdminLayout from '../../components/admin/AdminLayout'
import { useForm } from 'react-hook-form'

interface ChannelFormData {
  label: string
  icon_name: string
  bank_name: string
  iban: string
  description: string
  url: string
  is_active: boolean
  sort_order: number
}

function ChannelForm({ channel, onSubmit, onCancel }: {
  channel?: PaymentChannel | null
  onSubmit: (data: ChannelFormData) => Promise<void>
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ChannelFormData>({
    defaultValues: channel ? {
      label: channel.label,
      icon_name: channel.icon_name ?? '',
      bank_name: channel.bank_name ?? '',
      iban: channel.iban ?? '',
      description: channel.description ?? '',
      url: channel.url ?? '',
      is_active: channel.is_active,
      sort_order: channel.sort_order,
    } : {
      label: '',
      icon_name: 'Building2',
      is_active: true,
      sort_order: 0,
    },
  })

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelClass}>Etiket *</label>
        <input {...register('label', { required: true })} className={inputClass} placeholder="Banka Havalesi" />
      </div>
      <div>
        <label className={labelClass}>İkon Adı</label>
        <select {...register('icon_name')} className={inputClass}>
          <option value="Building2">Building2 (Banka)</option>
          <option value="Globe">Globe (İnternet)</option>
          <option value="Smartphone">Smartphone (Mobil)</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Banka Adı</label>
        <input {...register('bank_name')} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>IBAN</label>
        <input {...register('iban')} className={inputClass} placeholder="TR00 0001 ..." />
      </div>
      <div>
        <label className={labelClass}>Açıklama</label>
        <textarea {...register('description')} rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>URL (Opsiyonel)</label>
        <input {...register('url')} className={inputClass} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Sıralama</label>
          <input {...register('sort_order', { valueAsNumber: true })} type="number" className={inputClass} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2">
            <input {...register('is_active')} type="checkbox" className="w-4 h-4 text-primary-500 rounded" />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary-500 text-white py-2.5 rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors min-h-[44px]"
        >
          {isSubmitting ? 'Kaydediliyor...' : channel ? 'Güncelle' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          İptal
        </button>
      </div>
    </form>
  )
}

export default function PaymentChannelsPage() {
  const { channels, loading, createChannel, updateChannel, deleteChannel } = usePaymentChannels()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PaymentChannel | null>(null)

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ id: string } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  const handleCreate = async (data: ChannelFormData) => {
    try {
      await createChannel(data)
      setShowForm(false)
      showToast('Ödeme kanalı oluşturuldu', 'success')
    } catch {
      showToast('Kanal oluşturulurken hata oluştu', 'error')
    }
  }

  const handleUpdate = async (data: ChannelFormData) => {
    if (!editing) return
    try {
      await updateChannel(editing.id, data)
      setEditing(null)
      showToast('Ödeme kanalı güncellendi', 'success')
    } catch {
      showToast('Güncelleme sırasında hata oluştu', 'error')
    }
  }

  const handleDeleteRequest = (id: string) => {
    setConfirmDialog({ id })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDialog) return
    const { id } = confirmDialog
    setConfirmDialog(null)
    try {
      await deleteChannel(id)
      showToast('Ödeme kanalı silindi', 'success')
    } catch {
      showToast('Silme işlemi sırasında hata oluştu', 'error')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page title + actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Ödeme Kanalları</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Yeni Kanal
          </button>
        </div>

        {/* Channel list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : channels.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz ödeme kanalı yok.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {channels.map((ch) => (
                <div key={ch.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{ch.label}</p>
                    <p className="text-sm text-gray-500">
                      {ch.bank_name} {ch.iban && `— ${ch.iban}`}
                    </p>
                    {!ch.is_active && (
                      <span className="text-xs text-red-500">Pasif</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(ch)}
                      aria-label="Düzenle"
                      className="p-2.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(ch.id)}
                      aria-label="Sil"
                      className="p-2.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DonationModal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Ödeme Kanalı">
          <ChannelForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DonationModal>

        <DonationModal isOpen={!!editing} onClose={() => setEditing(null)} title="Ödeme Kanalı Düzenle">
          <ChannelForm channel={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </DonationModal>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!confirmDialog}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDialog(null)}
          title="Kanalı Sil"
          message="Bu ödeme kanalını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        />

        {/* Toast */}
        {toast && (
          <AdminToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
