import { useState } from 'react'
import { Building2, Globe, Smartphone, Copy, Check, ExternalLink, CircleCheckBig, MessageCircle, User, CreditCard, Landmark } from 'lucide-react'
import type { PaymentChannel } from '../types/donation'
import { isValidHttpsUrl } from '../lib/validation'
import OnlinePaymentForm from './OnlinePaymentForm'
import TransferDescription from './TransferDescription'
import type { DonationType } from './TransferDescription'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Globe,
  Smartphone,
}

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE

type PaymentTab = 'transfer' | 'online'

interface PaymentMethodsProps {
  channels: PaymentChannel[]
  paymentRef: string | null
  selectedAmount: number
  itemId?: string
  itemTitle?: string
  donationType?: DonationType
}

export default function PaymentMethods({ channels, paymentRef, selectedAmount, itemId, itemTitle, donationType = 'school' }: PaymentMethodsProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('transfer')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [ibanCopied, setIbanCopied] = useState(false)
  const [transferDone, setTransferDone] = useState(false)
  const [donorName, setDonorName] = useState('')

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setIbanCopied(true)
      setTimeout(() => setCopiedId(null), 3000)
    } catch {
      // Clipboard API failed - IBAN is still visible for manual copy
    }
  }

  if (channels.length === 0) return null

  const whatsappMessage = [
    'Merhaba,',
    donorName ? `${donorName} olarak` : '',
    `${paymentRef ? `${paymentRef} referanslı ` : ''}₺${selectedAmount.toLocaleString('tr-TR')} tutarında bağış havalesi yaptım.`,
  ].filter(Boolean).join(' ')

  const whatsappUrl = WHATSAPP_PHONE
    ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  return (
    <div className="space-y-4" data-payment-methods>
      <h3 className="font-semibold text-gray-800 text-lg">Bağışınızı Nasıl Göndermek İstersiniz?</h3>

      {/* Payment method tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'transfer'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Havale / EFT
        </button>
        <button
          onClick={() => setActiveTab('online')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'online'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Kredi Kartı
        </button>
      </div>

      {/* Online payment tab */}
      {activeTab === 'online' && itemId && (
        <OnlinePaymentForm itemId={itemId} amount={selectedAmount} itemTitle={itemTitle} donationType={donationType} />
      )}

      {activeTab === 'online' && !itemId && (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Online ödeme şu an hazırlanıyor.</p>
        </div>
      )}

      {/* Bank transfer tab */}
      {activeTab === 'transfer' && <>
      {/* Donor name input - shown before IBAN copy */}
      {!ibanCopied && (
        <div className="payment-donor-card bg-gradient-to-br from-accent-50 via-amber-50 to-accent-50 border-2 border-accent-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-600" />
            </div>
            <label className="text-sm font-semibold text-accent-700">Adınız (opsiyonel)</label>
          </div>
          <div className="custom-input-wrapper rounded-xl p-[2px]">
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Bağışçı olarak görünecek isminiz"
              className="w-full px-4 py-3.5 rounded-[10px] bg-white text-base font-medium text-gray-800 placeholder:text-gray-300 placeholder:font-normal focus:outline-none transition-all duration-200"
            />
          </div>
          <p className="text-xs text-accent-500 mt-2 ml-1">Bu bilgi bağışçılar listesinde görünecektir</p>
        </div>
      )}

      {/* Success banner after IBAN copy */}
      {ibanCopied && !transferDone && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 animate-fadeInUp">
          <div className="flex items-start gap-3">
            <CircleCheckBig className="w-6 h-6 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary-800">IBAN kopyalandı!</p>
              {donorName && (
                <p className="text-sm text-primary-600 mt-0.5">
                  Bağışçı: <strong>{donorName}</strong>
                </p>
              )}
              <p className="text-sm text-primary-600 mt-1">
                Bankanızdan havale yaparken açıklama kısmına aşağıdaki hazır metni kopyalayıp yapıştırmayı unutmayın.
              </p>
              <button
                onClick={() => setTransferDone(true)}
                className="mt-3 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors min-h-[44px]"
              >
                Havale Yaptım
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank you message + WhatsApp notification */}
      {transferDone && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center animate-fadeInUp space-y-4">
          <CircleCheckBig className="w-12 h-12 text-primary-500 mx-auto" />
          <div>
            <p className="font-semibold text-primary-800 text-lg">
              {donorName ? `Teşekkür ederiz, ${donorName}!` : 'Teşekkür ederiz!'}
            </p>
            <p className="text-primary-600 mt-1">
              Bağışınız okulumuzun öğrencileri için çok değerli. Desteğiniz hayat değiştiriyor.
            </p>
          </div>

          {whatsappUrl && (
            <div className="border-t border-primary-200 pt-4">
              <p className="text-sm text-primary-700 mb-3">
                Bağışınızın hızlıca eşleştirilmesi için lütfen okula bildirim gönderin:
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1da851] transition-colors min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp ile Okula Bildir
              </a>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3" key="channels">
        {channels.map((channel) => {
          const Icon = channel.icon_name ? iconMap[channel.icon_name] ?? Building2 : Building2

          return (
            <div key={channel.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{channel.label}</p>
                  {channel.bank_name && (
                    <p className="text-sm text-gray-500">{channel.bank_name}</p>
                  )}
                </div>
              </div>

              {channel.iban && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-500">IBAN</p>
                  <p className="font-mono text-base text-gray-800 select-all break-all">{channel.iban}</p>
                  <p className="text-xs text-gray-500">
                    Hesap Sahibi: <strong className="text-gray-700">Dumlupınar İlkokulu Okul Aile Birliği</strong>
                  </p>
                  <button
                    onClick={() => copyToClipboard(channel.iban!, channel.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all min-h-[44px]"
                  >
                    {copiedId === channel.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopyalandı!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        IBAN'ı Kopyala
                      </>
                    )}
                  </button>
                </div>
              )}

              {itemTitle && (
                <TransferDescription
                  donorName={donorName}
                  itemTitle={itemTitle}
                  donationType={donationType}
                  amount={selectedAmount}
                />
              )}

              {selectedAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-600 mb-0.5">Seçtiğiniz Tutar</p>
                  <p className="font-semibold text-blue-800 text-lg">₺{selectedAmount.toLocaleString('tr-TR')}</p>
                </div>
              )}

              {channel.description && (
                <p className="text-sm text-gray-500">{channel.description}</p>
              )}

              {channel.url && isValidHttpsUrl(channel.url) && (
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  Online Bankacılığa Git
                </a>
              )}
            </div>
          )
        })}
      </div>
      </>}
    </div>
  )
}
