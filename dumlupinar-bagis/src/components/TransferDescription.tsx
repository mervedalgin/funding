import { useState } from 'react'
import { Copy, Check, ShieldCheck, Scale, Lock, ChevronDown, ChevronUp } from 'lucide-react'

export type DonationType = 'school' | 'student'

interface TransferDescriptionProps {
  donorName: string
  itemTitle: string
  donationType: DonationType
  amount: number
}

function buildDescription(donorName: string, itemTitle: string, donationType: DonationType): string {
  const name = donorName.trim() || '[Adınız Soyadınız]'
  if (donationType === 'student') {
    return `${name} - İhtiyaç sahibi öğrencilere ${itemTitle} alınması şartıyla yapılan bağıştır`
  }
  return `${name} - Okula ${itemTitle} alınması şartıyla yapılan bağıştır.`
}

function getLegalInfos(donationType: DonationType, itemTitle: string, amount: number) {
  const amountStr = `₺${amount.toLocaleString('tr-TR')}`
  return [
    {
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      text: 'Banka dekontunun açıklama kısmına adınızı ve bağışın türünü yazmanız, o dekontun hukuken resmi bir bağış belgesi olarak işlem görmesini sağlar.',
    },
    {
      icon: Scale,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      text: `Açıklamadaki "şartıyla" ibaresi, gönderdiğiniz ${amountStr}'yi yasal olarak "şartlı bağış" statüsüne sokar.`,
    },
    {
      icon: Lock,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      text: donationType === 'student'
        ? `Bu sayede Okul-Aile Birliği Yönetim Kurulu, gönderdiğiniz bu parayı okulun boya, temizlik veya kırtasiye gibi diğer hiçbir acil ihtiyacı için kullanamaz; tutarın münhasıran belirttiğiniz amaca (${itemTitle}) tahsis edilmesi yasal bir zorunluluk olur.`
        : `Bu sayede Okul-Aile Birliği Yönetim Kurulu, gönderdiğiniz bu parayı okulun boya, temizlik veya kırtasiye gibi diğer hiçbir acil ihtiyacı için kullanamaz; tutarın münhasıran belirttiğiniz amaca (${itemTitle}) tahsis edilmesi yasal bir zorunluluk olur.`,
    },
  ]
}

export default function TransferDescription({ donorName, itemTitle, donationType, amount }: TransferDescriptionProps) {
  const [copied, setCopied] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const description = buildDescription(donorName, itemTitle, donationType)
  const legalInfos = getLegalInfos(donationType, itemTitle, amount)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // fallback: text is selectable
    }
  }

  const borderClass = donationType === 'student' ? 'border-indigo-200' : 'border-accent-200'
  const bgClass = donationType === 'student' ? 'bg-indigo-50' : 'bg-accent-50'
  const labelColor = donationType === 'student' ? 'text-indigo-600' : 'text-accent-600'
  const textColor = donationType === 'student' ? 'text-indigo-900' : 'text-accent-900'
  const btnBg = donationType === 'student' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-accent-500 hover:bg-accent-600'

  return (
    <div className={`${bgClass} border ${borderClass} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="p-4 pb-3">
        <p className={`text-xs font-semibold uppercase tracking-wider ${labelColor} mb-2`}>
          Havale Açıklaması
        </p>

        {/* Description text - copyable */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
          <p className={`text-sm font-medium ${textColor} leading-relaxed select-all`}>
            {description}
          </p>
          {!donorName.trim() && (
            <p className={`text-xs ${labelColor} mt-2 italic`}>
              Yukarıda adınızı girdikten sonra açıklama otomatik güncellenir
            </p>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${btnBg} text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all min-h-[44px] shadow-sm`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Kopyalandı!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Açıklamayı Kopyala
            </>
          )}
        </button>
      </div>

      {/* Legal info toggle */}
      <button
        onClick={() => setInfoOpen(!infoOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 border-t ${borderClass} hover:bg-white/40 transition-colors`}
      >
        <span className={`text-xs font-semibold ${labelColor}`}>
          Bu açıklamayı kullanmanızın hukuki faydaları
        </span>
        {infoOpen ? (
          <ChevronUp className={`w-4 h-4 ${labelColor}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${labelColor}`} />
        )}
      </button>

      {/* Legal info cards */}
      {infoOpen && (
        <div className="px-4 pb-4 space-y-2.5 animate-fadeInUp">
          {legalInfos.map((info, i) => (
            <div key={i} className={`flex gap-3 ${info.bg} rounded-xl p-3.5`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg ${info.bg} flex items-center justify-center`}>
                <info.icon className={`w-4 h-4 ${info.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 mb-0.5">{i + 1}. Hukuki Fayda</p>
                <p className="text-xs text-gray-600 leading-relaxed">{info.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { buildDescription }
