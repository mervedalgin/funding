import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FaqItem } from '../../types/donation'

const FAQ_CATEGORIES = [
  { value: 'genel', label: 'Genel' },
  { value: 'hukuki', label: 'Hukuki' },
  { value: 'odeme', label: 'Ödeme' },
  { value: 'bagis', label: 'Bağış Süreci' },
  { value: 'okul', label: 'Okul' },
  { value: 'ogrenci', label: 'Öğrenci' },
] as const

const schema = z.object({
  question: z.string().min(1, 'Soru zorunlu').max(500, 'Soru en fazla 500 karakter olabilir'),
  answer: z.string().min(1, 'Cevap zorunlu').max(5000, 'Cevap en fazla 5000 karakter olabilir'),
  category: z.string().default('genel'),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
})

interface FaqFormProps {
  item?: FaqItem | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export default function FaqForm({ item, onSubmit, onCancel }: FaqFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema) as never,
    defaultValues: item ? {
      question: item.question,
      answer: item.answer,
      category: item.category,
      sort_order: item.sort_order,
      is_active: item.is_active,
    } : {
      category: 'genel',
      sort_order: 0,
      is_active: true,
    },
  })

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-base transition-all duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>Soru *</label>
        <input {...register('question')} className={inputClass} placeholder="Bağış nasıl yapılır?" />
        {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message as string}</p>}
      </div>

      <div>
        <label className={labelClass}>Cevap *</label>
        <textarea {...register('answer')} rows={5} className={inputClass} placeholder="Detaylı cevabı buraya yazın..." />
        {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kategori</label>
          <select {...register('category')} className={inputClass}>
            {FAQ_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sıra</label>
          <input {...register('sort_order')} type="number" className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          {...register('is_active')}
          type="checkbox"
          id="faq-active"
          className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="faq-active" className="text-sm text-gray-700 font-medium">Aktif (sayfada görünsün)</label>
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

export { FAQ_CATEGORIES }
