import { useState, useRef, useEffect } from 'react'
import { Check, Sparkles, Heart, HandHeart, Users, TrendingUp } from 'lucide-react'
import type { AmountOption } from '../types/donation'

interface StudentAmountSelectorProps {
  unitPrice: number
  studentCount: number
  targetAmount?: number
  collectedAmount?: number
  onSelect: (amount: number, option: AmountOption) => void
}

export default function StudentAmountSelector({ unitPrice, studentCount, targetAmount = 0, collectedAmount = 0, onSelect }: StudentAmountSelectorProps) {
  const [selected, setSelected] = useState<AmountOption>('full')
  const [customStudentCount, setCustomStudentCount] = useState<string>('1')
  const inputRef = useRef<HTMLInputElement>(null)

  // Dynamic: use remaining if target exists
  const isDynamic = targetAmount > 0
  const remaining = isDynamic ? Math.max(0, targetAmount - collectedAmount) : studentCount * unitPrice
  const progressPercent = isDynamic && targetAmount > 0 ? Math.min((collectedAmount / targetAmount) * 100, 100) : 0

  const fullAmount = remaining
  const halfAmount = Math.round(remaining / 2)

  // For custom: how many students can still be covered
  const remainingStudents = isDynamic ? Math.max(0, Math.ceil(remaining / unitPrice)) : studentCount
  const maxCustomStudents = Math.min(remainingStudents, studentCount)

  const handleSelect = (option: AmountOption) => {
    setSelected(option)
    if (option === 'full') onSelect(fullAmount, 'full')
    else if (option === 'half') onSelect(halfAmount, 'half')
    else if (option === 'custom') {
      const count = Math.max(1, Math.min(Number(customStudentCount) || 1, maxCustomStudents))
      onSelect(count * unitPrice, 'custom')
    }
  }

  const handleCustomChange = (value: string) => {
    setCustomStudentCount(value)
    const count = Number(value)
    if (selected === 'custom' && count >= 1 && count <= maxCustomStudents) {
      onSelect(count * unitPrice, 'custom')
    }
  }

  useEffect(() => {
    if (selected === 'custom' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selected])

  const customCount = Math.max(1, Math.min(Number(customStudentCount) || 1, maxCustomStudents))
  const customTotal = customCount * unitPrice
  const isCustomValid = Number(customStudentCount) >= 1 && Number(customStudentCount) <= maxCustomStudents

  // Fully funded
  if (isDynamic && remaining <= 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-emerald-800 text-lg">Bu ihtiyaç tamamen karşılandı!</p>
        <p className="text-emerald-600 text-sm">Hayırseverlerimiz sayesinde hedefe ulaşıldı.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-lg">Kaç Öğrenciye Destek Olmak İstersiniz?</h3>

      {/* Progress info */}
      {isDynamic && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <TrendingUp className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-indigo-700 font-medium">
                Hedefe <strong>₺{remaining.toLocaleString('tr-TR')}</strong> kaldı
              </span>
              <span className="text-indigo-500 font-semibold">%{progressPercent.toFixed(0)}</span>
            </div>
            <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <Users className="w-5 h-5 text-indigo-600 shrink-0" />
        <p className="text-sm text-indigo-800">
          <strong>{studentCount}</strong> öğrenci bu ihtiyaç için destek bekliyor.
          Birim fiyat: <strong>₺{unitPrice.toLocaleString('tr-TR')}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Tamamını Karşıla */}
        <button
          onClick={() => handleSelect('full')}
          aria-pressed={selected === 'full'}
          className={`relative group overflow-hidden rounded-2xl border-2 text-center transition-all duration-300 min-h-[160px] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
            selected === 'full'
              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 via-indigo-50 to-violet-50 shadow-lg ring-2 ring-indigo-200'
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full transition-all duration-500 ${
            selected === 'full' ? 'bg-indigo-100/60 scale-110' : 'bg-gray-50 group-hover:bg-indigo-50 group-hover:scale-110'
          }`} />
          <div className="relative p-5">
            <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              selected === 'full'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-110'
                : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
            }`}>
              <Heart className="w-5 h-5" />
            </div>
            {selected === 'full' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-fadeInUp shadow-sm">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors ${
              selected === 'full' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'
            }`}>Tamamını Karşıla</div>
            <div className={`text-2xl font-bold transition-colors ${
              selected === 'full' ? 'text-indigo-700' : 'text-gray-800'
            }`}>₺{fullAmount.toLocaleString('tr-TR')}</div>
            <div className={`text-xs mt-1 transition-colors ${
              selected === 'full' ? 'text-indigo-500' : 'text-gray-400'
            }`}>{isDynamic ? 'Kalan tutarın tamamı' : `${studentCount} öğrencinin tamamına destek`}</div>
          </div>
        </button>

        {/* Yarısını Üstlen */}
        <button
          onClick={() => handleSelect('half')}
          aria-pressed={selected === 'half'}
          className={`relative group overflow-hidden rounded-2xl border-2 text-center transition-all duration-300 min-h-[160px] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            selected === 'half'
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full transition-all duration-500 ${
            selected === 'half' ? 'bg-blue-100/60 scale-110' : 'bg-gray-50 group-hover:bg-blue-50 group-hover:scale-110'
          }`} />
          <div className="relative p-5">
            <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              selected === 'half'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-110'
                : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
            }`}>
              <HandHeart className="w-5 h-5" />
            </div>
            {selected === 'half' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-fadeInUp shadow-sm">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors ${
              selected === 'half' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
            }`}>Yarısını Üstlen</div>
            <div className={`text-2xl font-bold transition-colors ${
              selected === 'half' ? 'text-blue-700' : 'text-gray-800'
            }`}>₺{halfAmount.toLocaleString('tr-TR')}</div>
            <div className={`text-xs mt-1 transition-colors ${
              selected === 'half' ? 'text-blue-500' : 'text-gray-400'
            }`}>{isDynamic ? 'Kalan tutarın yarısı' : `${studentCount} öğrencinin yarısına katkı`}</div>
          </div>
        </button>

        {/* Sen Belirle */}
        <button
          onClick={() => handleSelect('custom')}
          aria-pressed={selected === 'custom'}
          className={`relative group overflow-hidden rounded-2xl border-2 text-center transition-all duration-300 min-h-[160px] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
            selected === 'custom'
              ? 'border-violet-500 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 shadow-lg ring-2 ring-violet-200'
              : 'border-violet-200 bg-gradient-to-br from-violet-50/30 to-white hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full transition-all duration-500 ${
            selected === 'custom' ? 'bg-violet-100/60 scale-110' : 'bg-violet-50/50 group-hover:bg-violet-100/50 group-hover:scale-110'
          }`} />
          <div className="relative p-5">
            <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              selected === 'custom'
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30 scale-110'
                : 'bg-violet-100 text-violet-600 group-hover:bg-violet-200'
            }`}>
              {selected === 'custom' ? <Sparkles className="w-5 h-5 animate-pulse-soft" /> : <Users className="w-5 h-5" />}
            </div>
            {selected === 'custom' && (
              <div className="absolute top-3 right-3">
                <Sparkles className="w-5 h-5 text-violet-500 animate-pulse-soft" />
              </div>
            )}
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors ${
              selected === 'custom' ? 'text-violet-600' : 'text-violet-500 group-hover:text-violet-600'
            }`}>Sen Belirle</div>
            <div className={`text-2xl font-bold mb-1 transition-colors ${
              selected === 'custom' ? 'text-violet-700' : 'text-violet-600'
            }`}>? Öğrenci</div>
            <div className={`text-xs transition-colors ${
              selected === 'custom' ? 'text-violet-500' : 'text-gray-400'
            }`}>Kaç öğrenciye destek olacaksın?</div>
          </div>
        </button>
      </div>

      {/* Custom student count input */}
      {selected === 'custom' && (
        <div className="mt-4 animate-fadeInUp">
          <div className="relative custom-input-wrapper rounded-2xl p-[3px]">
            <div className="relative bg-white rounded-[13px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 font-bold text-sm">Öğrenci</span>
              <input
                ref={inputRef}
                type="number"
                value={customStudentCount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="1"
                min={1}
                max={maxCustomStudents}
                aria-label={`Desteklenecek öğrenci sayısı, 1 ile ${maxCustomStudents} arası`}
                className="w-full pl-20 pr-14 py-4 rounded-[13px] text-lg font-semibold text-gray-800 placeholder:text-gray-300 placeholder:font-normal focus:outline-none bg-transparent"
              />
              {isCustomValid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center animate-fadeInUp">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {Number(customStudentCount) > maxCustomStudents && (
            <p className="text-red-500 text-sm mt-2 ml-1">
              En fazla {maxCustomStudents} öğrenci seçebilirsiniz
            </p>
          )}
          {Number(customStudentCount) < 1 && customStudentCount !== '' && (
            <p className="text-red-500 text-sm mt-2 ml-1">
              En az 1 öğrenci seçmelisiniz
            </p>
          )}
          {isCustomValid && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mt-3 animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-700 font-medium">
                    {customCount} öğrenci x ₺{unitPrice.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-xs text-violet-500 mt-0.5">
                    {customCount} öğrencinin ihtiyacını karşılayacaksınız
                  </p>
                </div>
                <p className="text-2xl font-bold text-violet-700">
                  ₺{customTotal.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
