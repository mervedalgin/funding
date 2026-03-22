import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X as XIcon, Plus, Loader2 } from 'lucide-react'
import type { DonationStory } from '../../types/donation'
import { useDonationItems } from '../../hooks/useDonationItems'
import { slugify } from '../../hooks/useStories'
import RichTextEditor from './RichTextEditor'
import { processImageWithPreview } from '../../lib/imageUtils'
import { uploadImage } from '../../lib/storage'

const schema = z.object({
  title: z.string().min(1, 'Başlık zorunlu').max(200),
  slug: z.string().min(1, 'Slug zorunlu').max(80),
  summary: z.string().max(500, 'Özet en fazla 500 karakter').optional(),
  content: z.string().min(1, 'İçerik zorunlu'),
  cover_image_url: z.string().optional(),
  gallery_images: z.array(z.string()).default([]),
  donation_item_id: z.string().optional(),
  donation_amount: z.coerce.number().optional(),
  impact_text: z.string().optional(),
  completed_at: z.string().optional(),
  tags: z.string().optional(), // comma-separated, parsed on submit
  is_published: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
})

interface StoryFormProps {
  item?: DonationStory | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export default function StoryForm({ item, onSubmit, onCancel }: StoryFormProps) {
  const { items: donationItems } = useDonationItems(true)
  const completedItems = donationItems.filter(i => i.status === 'completed')

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    resolver: zodResolver(schema) as never,
    defaultValues: item ? {
      title: item.title,
      slug: item.slug,
      summary: item.summary ?? '',
      content: item.content,
      cover_image_url: item.cover_image_url ?? '',
      gallery_images: item.gallery_images ?? [],
      donation_item_id: item.donation_item_id ?? '',
      donation_amount: item.donation_amount ?? 0,
      impact_text: item.impact_text ?? '',
      completed_at: item.completed_at ?? '',
      tags: (item.tags ?? []).join(', '),
      is_published: item.is_published,
      sort_order: item.sort_order,
    } : {
      slug: '',
      content: '',
      gallery_images: [],
      is_published: false,
      sort_order: 0,
    },
  })

  const [editorContent, setEditorContent] = useState(item?.content ?? '')
  const [coverPreview, setCoverPreview] = useState<string | null>(item?.cover_image_url ?? null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(item?.gallery_images ?? [])
  const [uploading, setUploading] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const title = watch('title')

  // Auto-generate slug from title (only for new items)
  useEffect(() => {
    if (!item && title) {
      setValue('slug', slugify(title))
    }
  }, [title, item, setValue])

  const handleContentChange = (html: string) => {
    setEditorContent(html)
    setValue('content', html, { shouldValidate: true })
  }

  // Auto-fill from donation item
  const handleDonationItemSelect = (itemId: string) => {
    setValue('donation_item_id', itemId)
    const selected = donationItems.find(i => i.id === itemId)
    if (selected) {
      setValue('donation_amount', selected.collected_amount)
      setValue('impact_text', selected.impact_text ?? '')
      if (selected.updated_at) {
        setValue('completed_at', selected.updated_at.split('T')[0])
      }
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('cover')
    try {
      const { file: processed, previewUrl } = await processImageWithPreview(file)
      setCoverPreview(previewUrl)
      const url = await uploadImage(processed)
      setValue('cover_image_url', url)
    } catch { /* silently fail */ }
    setUploading(null)
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || galleryPreviews.length >= 4) return
    setUploading('gallery')
    try {
      const { file: processed, previewUrl } = await processImageWithPreview(file)
      const url = await uploadImage(processed)
      const newPreviews = [...galleryPreviews, previewUrl]
      const currentGallery = watch('gallery_images') as string[] || []
      const newGallery = [...currentGallery, url]
      setGalleryPreviews(newPreviews)
      setValue('gallery_images', newGallery)
    } catch { /* silently fail */ }
    setUploading(null)
  }

  const removeGalleryImage = (index: number) => {
    const newPreviews = galleryPreviews.filter((_, i) => i !== index)
    const currentGallery = watch('gallery_images') as string[] || []
    const newGallery = currentGallery.filter((_, i) => i !== index)
    setGalleryPreviews(newPreviews)
    setValue('gallery_images', newGallery)
  }

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    // Parse tags from comma-separated string
    const tagsStr = data.tags as string || ''
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean)
    await onSubmit({ ...data, tags })
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base transition-all duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const sectionClass = "bg-gray-50/50 rounded-2xl p-5 space-y-4 border border-gray-100"
  const sectionTitleClass = "text-sm font-semibold text-gray-800 uppercase tracking-wider"

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Hikaye Bilgileri</h3>
        <div>
          <label className={labelClass}>Başlık *</label>
          <input {...register('title')} className={inputClass} placeholder="Akıllı Tahta Hikayesi" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
        </div>
        <div>
          <label className={labelClass}>URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 shrink-0">/bagis-hikayeleri/</span>
            <input {...register('slug')} className={inputClass} placeholder="akilli-tahta-hikayesi" />
          </div>
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>}
        </div>
        <div>
          <label className={labelClass}>Özet <span className="text-gray-400 font-normal">(kart önizlemesinde görünür)</span></label>
          <textarea {...register('summary')} rows={2} className={inputClass} placeholder="Kısa özet (max 500 karakter)" />
        </div>
        <div>
          <label className={labelClass}>Hikaye İçeriği *</label>
          <RichTextEditor content={editorContent} onChange={handleContentChange} placeholder="Bağış hikayesini buraya yazın..." />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message as string}</p>}
        </div>
      </div>

      {/* Kapak Görseli */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Kapak Görseli</h3>
        {coverPreview ? (
          <div className="relative group">
            <img src={coverPreview} alt="Kapak" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
            <button type="button" onClick={() => { setCoverPreview(null); setValue('cover_image_url', '') }}
              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div onClick={() => !uploading && coverInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${uploading === 'cover' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'}`}>
            {uploading === 'cover' ? (
              <Loader2 className="w-8 h-8 text-primary-400 mx-auto animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-300 mx-auto" />
            )}
            <p className="text-sm text-gray-500 mt-2">{uploading === 'cover' ? 'Yükleniyor...' : 'Kapak görseli yükleyin (1200x600 önerilen)'}</p>
          </div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      </div>

      {/* Galeri Görselleri */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Galeri Görselleri <span className="font-normal text-gray-400">(max 4)</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {galleryPreviews.map((src, i) => (
            <div key={i} className="relative group aspect-[3/2]">
              <img src={src} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-gray-200" />
              <button type="button" onClick={() => removeGalleryImage(i)}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <XIcon className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          ))}
          {galleryPreviews.length < 4 && (
            <div onClick={() => !uploading && galleryInputRef.current?.click()}
              className={`aspect-[3/2] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${uploading === 'gallery' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300'}`}>
              {uploading === 'gallery' ? <Loader2 className="w-5 h-5 text-primary-400 animate-spin" /> : <Plus className="w-5 h-5 text-gray-300" />}
              <span className="text-xs text-gray-400">{uploading === 'gallery' ? 'Yükleniyor' : 'Ekle'}</span>
            </div>
          )}
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
      </div>

      {/* Bağış Bağlantısı */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Bağış Bilgileri</h3>
        <div>
          <label className={labelClass}>Tamamlanan Bağış Kalemi <span className="text-gray-400 font-normal">(opsiyonel — seçince otomatik dolar)</span></label>
          <select onChange={(e) => handleDonationItemSelect(e.target.value)} defaultValue={item?.donation_item_id ?? ''} className={inputClass}>
            <option value="">Bağlantı yok</option>
            {completedItems.map(di => (
              <option key={di.id} value={di.id}>{di.title} — ₺{di.collected_amount.toLocaleString('tr-TR')}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bağış Tutarı (₺)</label>
            <input {...register('donation_amount')} type="number" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tamamlanma Tarihi</label>
            <input {...register('completed_at')} type="date" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Etki Yazısı</label>
          <input {...register('impact_text')} className={inputClass} placeholder="120 öğrenci bu sayede interaktif dersler alacak" />
        </div>
      </div>

      {/* Meta */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Yayın Ayarları</h3>
        <div>
          <label className={labelClass}>Etiketler <span className="text-gray-400 font-normal">(virgülle ayırın)</span></label>
          <input {...register('tags')} className={inputClass} placeholder="eğitim, teknoloji, spor" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sıra</label>
            <input {...register('sort_order')} type="number" className={inputClass} />
          </div>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-3">
              <input {...register('is_published')} type="checkbox" id="story-published"
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <label htmlFor="story-published" className="text-sm text-gray-700 font-medium">Yayınla</label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4 flex gap-3 -mb-6">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors min-h-[44px] shadow-sm">
          {isSubmitting ? 'Kaydediliyor...' : item ? 'Güncelle' : 'Hikaye Ekle'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]">
          İptal
        </button>
      </div>
    </form>
  )
}
