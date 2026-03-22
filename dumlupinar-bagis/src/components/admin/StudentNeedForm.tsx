import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, ImageIcon, X as XIcon } from 'lucide-react'
import type { StudentNeed } from '../../types/donation'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const schema = z.object({
  title: z.string().min(1, 'Başlık zorunlu').max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z.string().max(2000, 'Açıklama en fazla 2000 karakter olabilir').optional(),
  image_url: z.string().optional().refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('data:'),
    'Fotoğraf linki https:// ile başlamalıdır'
  ),
  price: z.coerce.number().min(1, 'Birim fiyat en az 1 ₺ olmalı'),
  student_count: z.coerce.number().int().min(1, 'En az 1 öğrenci').default(1),
  bank_name: z.string().max(100, 'Banka adı en fazla 100 karakter').optional(),
  iban: z.string().optional().refine(
    (val) => !val || /^TR\d{24}$/.test(val.replace(/\s/g, '')),
    'Geçerli bir IBAN girin (TR + 24 rakam)'
  ),
  payment_ref: z.string().max(50, 'Referans kodu en fazla 50 karakter').optional(),
  payment_url: z.string().optional().refine(
    (val) => !val || val.startsWith('https://'),
    'Link https:// ile başlamalıdır'
  ),
  internet_banking_url: z.string().optional().refine(
    (val) => !val || val.startsWith('https://'),
    'Link https:// ile başlamalıdır'
  ),
  impact_text: z.string().max(500, 'Etki metni en fazla 500 karakter').optional(),
  donor_count: z.coerce.number().int().min(0).default(0),
  custom_amount_min: z.coerce.number().min(0).default(10),
  target_amount: z.coerce.number().min(0).default(0),
  collected_amount: z.coerce.number().min(0).default(0),
  status: z.enum(['active', 'draft', 'completed']).default('draft'),
  sort_order: z.coerce.number().int().default(0),
}).refine(
  (data) => data.collected_amount <= data.target_amount || data.target_amount === 0,
  { message: 'Toplanan tutar hedef tutardan büyük olamaz', path: ['collected_amount'] }
)

interface StudentNeedFormProps {
  item?: StudentNeed | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export default function StudentNeedForm({ item, onSubmit, onCancel }: StudentNeedFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    resolver: zodResolver(schema) as never,
    defaultValues: item ? {
      title: item.title,
      description: item.description ?? '',
      image_url: item.image_url ?? '',
      price: item.price,
      student_count: item.student_count,
      bank_name: item.bank_name ?? '',
      iban: item.iban ?? '',
      payment_ref: item.payment_ref ?? '',
      payment_url: item.payment_url ?? '',
      internet_banking_url: item.internet_banking_url ?? '',
      impact_text: item.impact_text ?? '',
      donor_count: item.donor_count,
      custom_amount_min: item.custom_amount_min,
      target_amount: item.target_amount,
      collected_amount: item.collected_amount,
      status: item.status,
      sort_order: item.sort_order,
    } : {
      status: 'draft',
      price: 0,
      student_count: 1,
      donor_count: 0,
      custom_amount_min: 10,
      target_amount: 0,
      collected_amount: 0,
      sort_order: 0,
    },
  })

  const imageUrl = watch('image_url')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) { setFileError('Sadece JPG, PNG ve WebP formatları kabul edilir'); return }
    if (file.size > MAX_FILE_SIZE) { setFileError('Dosya boyutu 2MB\'den küçük olmalıdır'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setFilePreview(base64)
      setValue('image_url', base64)
    }
    reader.readAsDataURL(file)
  }

  const clearFilePreview = () => {
    setFilePreview(null)
    setValue('image_url', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-base transition-all duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const sectionClass = "bg-gray-50/50 rounded-2xl p-5 space-y-4 border border-gray-100"
  const sectionTitleClass = "text-sm font-semibold text-gray-800 uppercase tracking-wider"

  const currentPreview = filePreview || (typeof imageUrl === 'string' && imageUrl.startsWith('https://') ? imageUrl : null)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Temel Bilgiler</h3>
        <div>
          <label className={labelClass}>Başlık *</label>
          <input {...register('title')} className={inputClass} placeholder="Örn: Mehmet - Kışlık Mont" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
        </div>
        <div>
          <label className={labelClass}>Açıklama</label>
          <textarea {...register('description')} rows={3} className={inputClass} placeholder="Öğrenci ihtiyacı hakkında bilgi" />
        </div>
        <div>
          <label className={labelClass}>Etki Metni</label>
          <input {...register('impact_text')} className={inputClass} placeholder="Örn: Bu destek sayesinde öğrencimiz kışı sıcak geçirecek" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sıra</label>
            <input {...register('sort_order')} type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Durum</label>
            <select {...register('status')} className={inputClass}>
              <option value="draft">Taslak</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlandı</option>
            </select>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Ödeme Bilgileri</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Birim Fiyat (₺)</label>
            <input {...register('price')} type="number" step="0.01" className={inputClass} placeholder="800" />
          </div>
          <div>
            <label className={labelClass}>Öğrenci Sayısı</label>
            <input {...register('student_count')} type="number" min="1" className={inputClass} placeholder="13" />
            {errors.student_count && <p className="text-red-500 text-xs mt-1">{errors.student_count.message as string}</p>}
          </div>
          <div>
            <label className={labelClass}>Min. Katkı (₺)</label>
            <input {...register('custom_amount_min')} type="number" step="0.01" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Hedef Tutar (₺)</label>
            <input {...register('target_amount')} type="number" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Toplanan (₺)</label>
            <input {...register('collected_amount')} type="number" step="0.01" className={inputClass} />
            {errors.collected_amount && <p className="text-red-500 text-xs mt-1">{errors.collected_amount.message as string}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bağışçı Sayısı</label>
            <input {...register('donor_count')} type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Referans Kodu</label>
            <input {...register('payment_ref')} className={inputClass} placeholder="OGR-001" />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Görsel</h3>
        {currentPreview && (
          <div className="relative group">
            <img src={currentPreview} alt="Önizleme" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
            <button type="button" onClick={clearFilePreview} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
        <div>
          <label className={labelClass}>Fotoğraf Linki</label>
          <input {...register('image_url')} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className={labelClass}>veya Dosya Yükle</label>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200">
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
            <div className="flex flex-col items-center gap-2">
              {filePreview ? <ImageIcon className="w-8 h-8 text-indigo-400" /> : <Upload className="w-8 h-8 text-gray-300" />}
              <p className="text-sm text-gray-500">{filePreview ? 'Başka dosya seçin' : 'JPG, PNG veya WebP (max 2MB)'}</p>
            </div>
          </div>
          {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4 flex gap-3 -mb-6">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors min-h-[44px] shadow-sm">
          {isSubmitting ? 'Kaydediliyor...' : item ? 'Güncelle' : 'Ekle'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]">
          İptal
        </button>
      </div>
    </form>
  )
}
