import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Package, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'
import { usePaymentChannels } from '../hooks/usePaymentChannels'
import type { DonationItem, AmountOption } from '../types/donation'
import AmountSelector from '../components/AmountSelector'
import PaymentMethods from '../components/PaymentMethods'
import ImpactBadge from '../components/ImpactBadge'
import ProgressBar from '../components/ProgressBar'
import { getOptimizedImageUrl } from '../lib/imageUtils'
import { isSecureImageUrl } from '../lib/validation'

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<DonationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const isCompleted = item?.status === 'completed'
  const { channels } = usePaymentChannels(isCompleted ?? false)

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return
      const { data } = await supabase
        .from('donation_items')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setItem(data as DonationItem)
        const remaining = data.target_amount > 0 ? Math.max(0, data.target_amount - data.collected_amount) : data.price
        setSelectedAmount(remaining)
      }
      setLoading(false)
    }
    fetchItem()
  }, [id])

  const handleAmountSelect = (amount: number, _option: AmountOption) => {
    setSelectedAmount(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-3xl px-4">
          <div className="h-64 rounded-2xl animate-shimmer" />
          <div className="h-8 w-2/3 rounded animate-shimmer" />
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-12 w-1/3 rounded animate-shimmer" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-500 text-lg">Aradığınız ihtiyaç bulunamadı.</p>
        <Link to="/" className="text-primary-600 hover:underline font-medium min-h-[44px] flex items-center">
          Tüm İhtiyaçları Gör
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <Helmet>
        <title>{item.title} - Dumlupınar İlkokulu Bağış</title>
        <meta name="description" content={item.description ?? `${item.title} için bağış yapın. Dumlupınar İlkokulu, Birecik, Şanlıurfa.`} />
        <meta property="og:title" content={`${item.title} - Dumlupınar İlkokulu Bağış`} />
        <meta property="og:description" content={item.description ?? `${item.title} için bağış yapın.`} />
        <meta property="og:type" content="article" />
        {item.image_url && <meta property="og:image" content={item.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${item.title} - Dumlupınar İlkokulu Bağış`} />
        <meta name="twitter:description" content={item.description ?? `${item.title} için bağış yapın.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DonateAction",
          "name": item.title,
          "description": item.description,
          "recipient": {
            "@type": "EducationalOrganization",
            "name": "Dumlupınar İlkokulu ve Ortaokulu"
          },
          "price": item.price,
          "priceCurrency": "TRY"
        })}</script>
      </Helmet>

      <Navbar />

      {/* Mini Hero */}
      <header className="relative overflow-hidden text-white pt-20 pb-8 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-56 h-56 bg-white/5 rounded-full -top-10 -right-10 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-40 h-40 bg-accent-500/8 rounded-full bottom-0 left-1/3 blur-xl" style={{ animationDelay: '2s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/20 rounded-full top-[40%] left-[15%]" style={{ animationDelay: '0s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-white/15 rounded-full top-[30%] left-[75%]" style={{ animationDelay: '2.5s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-3 animate-fadeInUp">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-primary-100 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            {item.title}
          </h2>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 animate-fadeInUp">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors min-h-[44px] p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          Tüm İhtiyaçları Gör
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {item.image_url && isSecureImageUrl(item.image_url) ? (
            <img src={getOptimizedImageUrl(item.image_url, 800, 400) ?? item.image_url} alt={item.title} loading="lazy" width={800} height={400} className="w-full h-48 sm:h-64 object-cover" />
          ) : (
            <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              <Package className="w-24 h-24 text-primary-300" />
            </div>
          )}

          <div className="p-5 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {item.title}
              </h1>
              {item.description && (
                <p className="text-gray-600 text-base md:text-lg">{item.description}</p>
              )}
            </div>

            <div className="inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-xl">
              <span className="text-3xl font-bold">₺{item.price.toLocaleString('tr-TR')}</span>
            </div>

            <ImpactBadge impactText={item.impact_text} donorCount={item.donor_count} />

            {item.target_amount > 0 && (
              <ProgressBar collected={item.collected_amount} target={item.target_amount} />
            )}

            {item.status !== 'completed' && (
              <>
                <hr className="border-gray-100" />
                <AmountSelector
                  price={item.price}
                  customAmountMin={item.custom_amount_min}
                  targetAmount={item.target_amount}
                  collectedAmount={item.collected_amount}
                  onSelect={handleAmountSelect}
                />

                <hr className="border-gray-100" />
                <PaymentMethods
                  channels={channels}
                  paymentRef={item.payment_ref}
                  selectedAmount={selectedAmount}
                  itemId={item.id}
                  itemTitle={item.title}
                  donationType="school"
                />
              </>
            )}

            {item.status === 'completed' && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center space-y-2">
                <p className="text-primary-800 font-semibold text-lg">
                  Bu ihtiyaç hayırseverlerimiz sayesinde karşılandı!
                </p>
                <p className="text-primary-600">
                  Desteğiniz öğrencilerimizin yüzünü güldürdü. Diğer ihtiyaçlarımıza da göz atabilirsiniz.
                </p>
                <Link to="/" className="inline-block mt-3 text-primary-700 font-medium hover:underline">
                  Diğer İhtiyaçları Gör
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {item.status !== 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-40" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-gray-500">Tutar: </span>
              <span className="font-bold text-primary-700">₺{selectedAmount.toLocaleString('tr-TR')}</span>
            </div>
            <button
              onClick={() => {
                const paymentSection = document.querySelector('[data-payment-methods]')
                paymentSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="cta-btn bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-600 transition-all duration-300 hover:scale-105 min-h-[44px] flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 cta-heartbeat" />
              Destek Ol
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
