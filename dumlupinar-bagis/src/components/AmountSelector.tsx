import { useState, useRef, useEffect } from 'react'
import { Check, Sparkles, Heart, HandHeart, Coins } from 'lucide-react'
import type { AmountOption } from '../types/donation'

interface AmountSelectorProps {
  price: number
  customAmountMin: number
  onSelect: (amount: number, option: AmountOption) => void
}

export default function AmountSelector({ price, customAmountMin, onSelect }: AmountSelectorProps) {
  const [selected, setSelected] = useState<AmountOption>('full')
  const [customAmount, setCustomAmount] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const halfPrice = Math.round(price / 2)

  const handleSelect = (option: AmountOption) => {
    setSelected(option)
    if (option === 'full') onSelect(price, 'full')
    else if (option === 'half') onSelect(halfPrice, 'half')
    else if (option === 'custom' && customAmount) {
      onSelect(Number(customAmount), 'custom')
    }
  }

  const handleCustomChange = (value: string) => {
    setCustomAmount(value)
    if (selected === 'custom' && Number(value) >= customAmountMin) {
      onSelect(Number(value), 'custom')
    }
  }

  // Auto-focus input when custom is selected
  useEffect(() => {
    if (selected === 'custom' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selected])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-lg">Ne Kadar Destek Olmak İstersiniz?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Tamamını Karşıla */}
        <button
          onClick={() => handleSelect('full')}
          aria-pressed={selected === 'full'}
          className={`relative group overflow-hidden rounded-2xl border-2 text-center transition-all duration-300 min-h-[140px] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
            selected === 'full'
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 via-primary-50 to-teal-50 shadow-lg ring-2 ring-primary-200 amount-card-selected'
              : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          {/* Background decoration */}
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full transition-all duration-500 ${
            selected === 'full' ? 'bg-primary-100/60 scale-110' : 'bg-gray-50 group-hover:bg-primary-50 group-hover:scale-110'
          }`} />

          <div className="relative p-5">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              selected === 'full'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-110'
                : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
            }`}>
              <Heart className="w-5 h-5" />
            </div>

            {selected === 'full' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center animate-fadeInUp shadow-sm">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}

            <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors ${
              selected === 'full' ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
            }`}>Tamamını Karşıla</div>

            <div className={`text-2xl font-bold mb-1 transition-colors ${
              selected === 'full' ? 'text-primary-700' : 'text-gray-800'
            }`}>₺{price.toLocaleString('tr-TR')}</div>

            <div className={`text-xs transition-colors ${
              selected === 'full' ? 'text-primary-500' : 'text-gray-400'
            }`}>Bu ihtiyacın tamamını karşılarsınız</div>
          </div>
        </button>

        {/* Yarısını Üstlen */}
        <button
          onClick={() => handleSelect('half')}
          aria-pressed={selected === 'half'}
          className={`relative group overflow-hidden rounded-2xl border-2 text-center transition-all duration-300 min-h-[140px] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            selected === 'half'
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200 amount-card-selected'
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

            <div className={`text-2xl font-bold mb-1 transition-colors ${
              selected === 'half' ? 'text-blue-700' : 'text-gray-800'
            }`}>₺{halfPrice.toLocaleString('tr-TR')}</div>

            <div className={`text-xs transition-colors ${
              selected === 'half' ? 'text-blue-500' : 'text-gray-400'
            }`}>İhtiyacın yarısına destek olursunuz</div>
          </div>
        </button>

        {/* Sen Belirle */}
        <button
          onClick={() => handleSelect('custom')}
          aria-pressed={selected === 'custom'}
          className={`relative group overflow-hidden rounded-2xl border-2 text-center transition-all duration-300 min-h-[140px] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
            selected === 'custom'
              ? 'border-accent-500 bg-gradient-to-br from-accent-50 via-amber-50 to-orange-50 shadow-lg ring-2 ring-accent-200 custom-card-glow'
              : 'border-accent-200 bg-gradient-to-br from-accent-50/30 to-white hover:border-accent-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full transition-all duration-500 ${
            selected === 'custom' ? 'bg-accent-100/60 scale-110' : 'bg-accent-50/50 group-hover:bg-accent-100/50 group-hover:scale-110'
          }`} />

          <div className="relative p-5">
            <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              selected === 'custom'
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/30 scale-110'
                : 'bg-accent-100 text-accent-600 group-hover:bg-accent-200'
            }`}>
              {selected === 'custom' ? (
                <Sparkles className="w-5 h-5 animate-pulse-soft" />
              ) : (
                <Coins className="w-5 h-5" />
              )}
            </div>

            {selected === 'custom' && (
              <div className="absolute top-3 right-3">
                <Sparkles className="w-5 h-5 text-accent-500 animate-pulse-soft" />
              </div>
            )}

            <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors ${
              selected === 'custom' ? 'text-accent-600' : 'text-accent-500 group-hover:text-accent-600'
            }`}>Dilediğin Kadar</div>

            <div className={`text-2xl font-bold mb-1 transition-colors ${
              selected === 'custom' ? 'text-accent-700' : 'text-accent-600'
            }`}>Sen Belirle</div>

            <div className={`text-xs transition-colors ${
              selected === 'custom' ? 'text-accent-500' : 'text-gray-400'
            }`}>Her katkı değerlidir</div>
          </div>
        </button>
      </div>

      {/* Custom amount input */}
      {selected === 'custom' && (
        <div className="mt-4 animate-fadeInUp">
          <div className="relative custom-input-wrapper rounded-2xl p-[3px]">
            <div className="relative bg-white rounded-[13px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-500 font-bold text-lg">₺</span>
              <input
                ref={inputRef}
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder={`Min. ₺${customAmountMin}`}
                min={customAmountMin}
                aria-label={`Bağış tutarı, minimum ₺${customAmountMin}`}
                className="w-full pl-10 pr-14 py-4 rounded-[13px] text-lg font-semibold text-gray-800 placeholder:text-gray-300 placeholder:font-normal focus:outline-none bg-transparent"
              />
              {customAmount && Number(customAmount) >= customAmountMin && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center animate-fadeInUp">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
          {customAmount && Number(customAmount) < customAmountMin && (
            <p className="text-red-500 text-sm mt-2 ml-1">
              Minimum katkı tutarı ₺{customAmountMin}
            </p>
          )}
          {customAmount && Number(customAmount) >= customAmountMin && (
            <p className="text-primary-600 text-sm mt-2 ml-1 font-medium animate-fadeInUp">
              ₺{Number(customAmount).toLocaleString('tr-TR')} ile harika bir destek olacaksınız!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
