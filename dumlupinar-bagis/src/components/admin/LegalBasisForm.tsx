import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Scale, FileText, BookOpen, ShieldCheck, Landmark, Gavel,
  ScrollText, BadgeCheck, Building2, FileCheck,
} from 'lucide-react'
import type { LegalBasisItem } from '../../types/donation'
import RichTextEditor from './RichTextEditor'

const ICON_OPTIONS = [
  { value: 'scale', label: 'Terazi', icon: Scale },
  { value: 'file-text', label: 'Belge', icon: FileText },
  { value: 'book-open', label: 'Kitap', icon: BookOpen },
  { value: 'shield-check', label: 'Kalkan', icon: ShieldCheck },
  { value: 'landmark', label: 'Kurum', icon: Landmark },
  { value: 'gavel', label: 'Tokmak', icon: Gavel },
  { value: 'scroll-text', label: 'Tüzük', icon: ScrollText },
  { value: 'badge-check', label: 'Onay', icon: BadgeCheck },
  { value: 'building-2', label: 'Bina', icon: Building2 },
  { value: 'file-check', label: 'Dosya Onay', icon: FileCheck },
] as const

export { ICON_OPTIONS }

const schema = z.object({
  title: z.string().min(1, 'Başlık zorunlu').max(300, 'Başlık en fazla 300 karakter'),
  content: z.string().min(1, 'İçerik zorunlu'),
  icon_name: z.string().default('scale'),
  url: z.string().optional().refine(
    (val) => !val || val.startsWith('https://'),
    'Link https:// ile başlamalıdır'
  ),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
})

interface LegalBasisFormProps {
  item?: LegalBasisItem | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export default function LegalBasisForm({ item, onSubmit, onCancel }: LegalBasisFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    resolver: zodResolver(schema) as never,
    defaultValues: item ? {
      title: item.title,
      content: item.content,
      icon_name: item.icon_name,
      url: item.url ?? '',
      sort_order: item.sort_order,
      is_active: item.is_active,
    } : {
      icon_name: 'scale',
      content: '',
      sort_order: 0,
      is_active: true,
    },
  })

  const [editorContent, setEditorContent] = useState(item?.content ?? '')
  const selectedIcon = watch('icon_name') || 'scale'

  const handleContentChange = (html: string) => {
    setEditorContent(html)
    setValue('content', html, { shouldValidate: true })
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base transition-all duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>Başlık *</label>
        <input {...register('title')} className={inputClass} placeholder="Örn: 5253 Sayılı Dernekler Kanunu" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
      </div>

      <div>
        <label className={labelClass}>İçerik *</label>
        <RichTextEditor
          content={editorContent}
          onChange={handleContentChange}
          placeholder="Yasal dayanak detaylarını buraya yazın..."
        />
        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message as string}</p>}
      </div>

      <div>
        <label className={labelClass}>Harici Link (opsiyonel)</label>
        <input {...register('url')} className={inputClass} placeholder="https://www.mevzuat.gov.tr/..." />
        {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message as string}</p>}
      </div>

      {/* Icon selector */}
      <div>
        <label className={labelClass}>Simge</label>
        <div className="grid grid-cols-5 gap-2">
          {ICON_OPTIONS.map(opt => {
            const IconComp = opt.icon
            const isSelected = selectedIcon === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('icon_name', opt.value)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                }`}
              >
                <IconComp className="w-5 h-5" />
                <span className="truncate w-full text-center">{opt.label}</span>
              </button>
            )
          })}
        </div>
        <input type="hidden" {...register('icon_name')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Sıra</label>
          <input {...register('sort_order')} type="number" className={inputClass} />
        </div>
        <div className="flex items-end pb-1">
          <div className="flex items-center gap-3">
            <input
              {...register('is_active')}
              type="checkbox"
              id="legal-active"
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="legal-active" className="text-sm text-gray-700 font-medium">Aktif (sayfada görünsün)</label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
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
