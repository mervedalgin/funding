import { useState } from 'react'
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import TransferDescription from './TransferDescription'
import type { DonationType } from './TransferDescription'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

interface OnlinePaymentFormProps {
  itemId: string
  amount: number
  itemTitle?: string
  donationType?: DonationType
}

export default function OnlinePaymentForm({ itemId, amount, itemTitle, donationType = 'school' }: OnlinePaymentFormProps) {
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation
    if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      setError('Geçerli bir e-posta adresi girin.')
      setLoading(false)
      return
    }
    if (donorPhone && !/^(05\d{9}|\+90\d{10})$/.test(donorPhone.replace(/\s/g, ''))) {
      setError('Geçerli bir telefon numarası girin (05XX XXX XX XX).')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          item_type: donationType === 'student' ? 'student_need' : 'donation_item',
          amount,
          donor_name: donorName || undefined,
          donor_email: donorEmail || undefined,
          donor_phone: donorPhone.replace(/\s/g, '') || undefined,
          provider: 'iyzico',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ödeme başlatılamadı')
        return
      }

      // Validate and redirect to payment gateway
      try {
        const checkoutUrl = new URL(data.checkout_url)
        if (checkoutUrl.protocol !== 'https:') {
          setError('Geçersiz ödeme bağlantısı.')
          return
        }
        window.location.href = data.checkout_url
      } catch {
        setError('Geçersiz ödeme bağlantısı.')
        return
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-700">
          Ödemeniz güvenli altyapı üzerinden işlenir. Kart bilgileriniz sunucularımızda saklanmaz.
        </p>
      </div>

      <div>
        <label htmlFor="online-name" className="block text-sm font-medium text-gray-700 mb-1">Adınız (opsiyonel)</label>
        <input
          id="online-name"
          type="text"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Bağışçı isminiz"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="online-email" className="block text-sm font-medium text-gray-700 mb-1">E-posta (opsiyonel)</label>
        <input
          id="online-email"
          type="email"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          placeholder="ornek@email.com"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="online-phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon (opsiyonel)</label>
        <input
          id="online-phone"
          type="tel"
          value={donorPhone}
          onChange={(e) => setDonorPhone(e.target.value)}
          placeholder="05XX XXX XX XX"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Ödenecek tutar</p>
        <p className="text-2xl font-bold text-primary-700">₺{amount.toLocaleString('tr-TR')}</p>
      </div>

      {itemTitle && (
        <TransferDescription
          donorName={donorName}
          itemTitle={itemTitle}
          donationType={donationType}
          amount={amount}
        />
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 min-h-[44px] shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            İşleniyor...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Kartla Öde
          </>
        )}
      </button>
    </form>
  )
}
