import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, ImageIcon, X as XIcon, Info } from 'lucide-react'
import type { DonationItem } from '../../types/donation'
import { processImageWithPreview, IMAGE_TARGET_WIDTH, IMAGE_TARGET_HEIGHT } from '../../lib/imageUtils'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (before processing)
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']

const schema = z.object({
  title: z.string().min(1, 'Başlık zorunlu').max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z.string().max(2000, 'Açıklama en fazla 2000 karakter olabilir').optional(),
  image_url: z.string().optional().refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('data:'),
    'Fotoğraf linki https:// ile başlamalıdır'
  ),
  price: z.coerce.number().min(1, 'Fiyat en az 1 ₺ olmalı'),
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

interface ItemFormProps {
  item?: DonationItem | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export default function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    resolver: zodResolver(schema) as never,
    defaultValues: item ? {
      title: item.title,
      description: item.description ?? '',
      image_url: item.image_url ?? '',
      price: item.price,
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

  const [processing, setProcessing] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Desteklenen formatlar: JPG, PNG, WebP, GIF, BMP')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Dosya boyutu 5MB\'den küçük olmalıdır')
      return
    }

    try {
      setProcessing(true)
      const { file: processed, previewUrl } = await processImageWithPreview(file)
      setFilePreview(previewUrl)
      // Convert to base64 for form storage — will be replaced with Supabase Storage URL later
      const reader = new FileReader()
      reader.onload = (ev) => {
        setValue('image_url', ev.target?.result as string)
      }
      reader.readAsDataURL(processed)
    } catch {
      setFileError('Resim işlenirken hata oluştu. Lütfen başka bir resim deneyin.')
    } finally {
      setProcessing(false)
    }
  }

  const clearFilePreview = () => {
    setFilePreview(null)
    setValue('image_url', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base transition-all duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const sectionClass = "bg-gray-50/50 rounded-2xl p-5 space-y-4 border border-gray-100"
  const sectionTitleClass = "text-sm font-semibold text-gray-800 uppercase tracking-wider"

  const currentPreview = filePreview || (typeof imageUrl === 'string' && imageUrl.startsWith('https://') ? imageUrl : null)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section: Temel Bilgiler */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Temel Bilgiler</h3>
        <div>
          <label className={labelClass}>Başlık *</label>
          <input {...register('title')} className={inputClass} placeholder="Örn: Akıllı Tahta" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
        </div>
        <div>
          <label className={labelClass}>Açıklama</label>
          <textarea {...register('description')} rows={3} className={inputClass} placeholder="Bu ihtiyaç hakkında kısa bilgi" />
        </div>
        <div>
          <label className={labelClass}>Etki Metni</label>
          <input {...register('impact_text')} className={inputClass} placeholder="Örn: 35 öğrencimiz bu sayede interaktif dersler alacak" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Görüntülenme Sırası</label>
            <input {...register('sort_order')} type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Durum</label>
            <select {...register('status')} className={inputClass}>
              <option value="draft">Taslak (yayında değil)</option>
              <option value="active">Aktif (bağışa açık)</option>
              <option value="completed">Tamamlandı (bağış kapandı)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Ödeme Bilgileri */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Ödeme Bilgileri</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fiyat (₺)</label>
            <input {...register('price')} type="number" step="0.01" className={inputClass} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message as string}</p>}
          </div>
          <div>
            <label className={labelClass}>Min. Katkı Tutarı (₺)</label>
            <input {...register('custom_amount_min')} type="number" step="0.01" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Hedef Tutar (₺)</label>
            <input {...register('target_amount')} type="number" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Toplanan Tutar (₺)</label>
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
            <label className={labelClass}>Havale Açıklama Kodu</label>
            <input {...register('payment_ref')} className={inputClass} placeholder="OKUL-001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Banka Adı</label>
            <input {...register('bank_name')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>IBAN</label>
            <input {...register('iban')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>İnternet Bankacılığı Linki</label>
          <input {...register('internet_banking_url')} className={inputClass} placeholder="https://..." />
          {errors.internet_banking_url && <p className="text-red-500 text-xs mt-1">{errors.internet_banking_url.message as string}</p>}
        </div>
      </div>

      {/* Section: Görsel */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Görsel</h3>

        {/* Image guidelines */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 space-y-0.5">
            <p className="font-medium">Herhangi bir resim yükleyebilirsiniz — otomatik olarak optimize edilir.</p>
            <p>Çıktı: {IMAGE_TARGET_WIDTH}x{IMAGE_TARGET_HEIGHT}px, WebP formatı, 2:1 yatay oran. Resmin ortası korunur, kenarlar kırpılır.</p>
          </div>
        </div>

        {/* Image preview */}
        {currentPreview && (
          <div className="relative group">
            <img
              src={currentPreview}
              alt="Önizleme"
              className="w-full h-48 object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={clearFilePreview}
              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
            >
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* URL input */}
        <div>
          <label className={labelClass}>Fotoğraf Linki (URL)</label>
          <input {...register('image_url')} className={inputClass} placeholder="https://..." />
          {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message as string}</p>}
        </div>

        {/* File upload */}
        <div>
          <label className={labelClass}>veya Dosya Yükle</label>
          <div
            onClick={() => !processing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
              processing
                ? 'border-primary-300 bg-primary-50/30 cursor-wait'
                : 'border-gray-200 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              {processing ? (
                <>
                  <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                  <p className="text-sm text-primary-600 font-medium">Resim optimize ediliyor...</p>
                </>
              ) : filePreview ? (
                <>
                  <ImageIcon className="w-8 h-8 text-primary-400" />
                  <p className="text-sm text-gray-500">Başka bir dosya seçmek için tıklayın</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-500">Herhangi bir resim dosyası seçin (max 5MB)</p>
                  <p className="text-xs text-gray-400">Otomatik olarak 1200x600 WebP'ye dönüştürülür</p>
                </>
              )}
            </div>
          </div>
          {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
        </div>
      </div>

      {/* Sticky action buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4 flex gap-3 -mb-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors min-h-[44px] shadow-sm"
        >
          {isSubmitting ? 'Kaydediliyor...' : item ? 'Güncelle' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
