import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart, BookOpen, MousePointer, Banknote, CheckCircle, ArrowRight } from 'lucide-react'
import { SITE_URL } from '../lib/constants'
import { useDonationItems } from '../hooks/useDonationItems'
import { useStudentNeeds } from '../hooks/useStudentNeeds'
import type { DonationItem, StudentNeed } from '../types/donation'
import Navbar from '../components/Navbar'
import DonationCard from '../components/DonationCard'
import StudentNeedCard from '../components/StudentNeedCard'
import SkeletonCard from '../components/SkeletonCard'
import TrustBanner from '../components/TrustBanner'
import LegalInfo from '../components/LegalInfo'
import DonorMarquee from '../components/DonorMarquee'

const steps = [
  {
    step: '1',
    title: 'İhtiyacı Seçin',
    desc: 'Okulumuzun ihtiyaç listesinden destek olmak istediğiniz kalemi seçin',
    icon: MousePointer,
    color: 'primary' as const,
  },
  {
    step: '2',
    title: 'Tutarı Belirleyin',
    desc: 'Tamamını, yarısını veya dilediğiniz kadar katkıda bulunun',
    icon: Banknote,
    color: 'blue' as const,
  },
  {
    step: '3',
    title: 'Havaleyi Yapın',
    desc: 'IBAN bilgilerini kopyalayın ve bankanızdan havale gönderin',
    icon: CheckCircle,
    color: 'accent' as const,
  },
]

const stepColors = {
  primary: {
    iconBg: 'bg-primary-500',
    iconBgHover: 'group-hover:bg-primary-500',
    iconText: 'text-white',
    iconTextDefault: 'text-primary-600',
    iconBgDefault: 'bg-primary-100',
    badge: 'bg-primary-500',
    line: 'from-primary-300 to-blue-300',
    glow: 'group-hover:shadow-primary-500/20',
    ring: 'ring-primary-100',
  },
  blue: {
    iconBg: 'bg-blue-500',
    iconBgHover: 'group-hover:bg-blue-500',
    iconText: 'text-white',
    iconTextDefault: 'text-blue-600',
    iconBgDefault: 'bg-blue-100',
    badge: 'bg-blue-500',
    line: 'from-blue-300 to-accent-300',
    glow: 'group-hover:shadow-blue-500/20',
    ring: 'ring-blue-100',
  },
  accent: {
    iconBg: 'bg-accent-500',
    iconBgHover: 'group-hover:bg-accent-500',
    iconText: 'text-white',
    iconTextDefault: 'text-accent-600',
    iconBgDefault: 'bg-accent-100',
    badge: 'bg-accent-500',
    line: '',
    glow: 'group-hover:shadow-accent-500/20',
    ring: 'ring-accent-100',
  },
}

export default function Home() {
  const { items, loading, error } = useDonationItems()
  const { items: studentItems, loading: studentLoading, error: studentError } = useStudentNeeds()

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>Dumlupınar İlkokulu - Bağış Sayfası</title>
        <meta name="description" content="Birecik, Şanlıurfa Dumlupınar İlkokulu ihtiyaç listesi ve bağış sayfası. Okulumuzun ihtiyaçlarına destek olun." />
        <meta property="og:title" content="Dumlupınar İlkokulu - Bağış Sayfası" />
        <meta property="og:description" content="Birecik, Şanlıurfa Dumlupınar İlkokulu ihtiyaç listesi ve bağış sayfası. Okulumuzun ihtiyaçlarına destek olun." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dumlupınar İlkokulu - Bağış Sayfası" />
        <meta name="twitter:description" content="Birecik, Şanlıurfa Dumlupınar İlkokulu ihtiyaç listesi ve bağış sayfası." />
        <meta name="twitter:image" content="/logo.png" />
        <link rel="canonical" href={SITE_URL} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Dumlupınar İlkokulu",
          "description": "Birecik, Şanlıurfa'da bulunan Dumlupınar İlkokulu bağış platformu",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Birecik",
            "addressRegion": "Şanlıurfa",
            "addressCountry": "TR"
          },
          "telephone": "(0414) 652 12 52",
          "url": window.location.origin
        })}</script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-20 hero-animated-bg">
        {/* Animated gradient background */}
        <div className="absolute inset-0 hero-gradient-animate" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-72 h-72 bg-white/5 rounded-full -top-20 -left-20 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-96 h-96 bg-accent-500/10 rounded-full -bottom-32 -right-32 blur-2xl" style={{ animationDelay: '2s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-primary-300/10 rounded-full top-1/3 right-1/4 blur-xl" style={{ animationDelay: '4s' }} />
          <div className="hero-float-shape absolute w-32 h-32 bg-white/5 rounded-full bottom-1/4 left-1/3 blur-lg" style={{ animationDelay: '1s' }} />
          <div className="hero-float-shape absolute w-64 h-64 bg-accent-400/8 rounded-full top-1/4 -left-10 blur-2xl" style={{ animationDelay: '3s' }} />

          {/* Animated particles */}
          <div className="hero-particle absolute w-2 h-2 bg-white/20 rounded-full top-[20%] left-[15%]" style={{ animationDelay: '0s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/15 rounded-full top-[60%] left-[80%]" style={{ animationDelay: '1.5s' }} />
          <div className="hero-particle absolute w-2.5 h-2.5 bg-accent-300/20 rounded-full top-[40%] left-[60%]" style={{ animationDelay: '3s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/20 rounded-full top-[75%] left-[30%]" style={{ animationDelay: '2s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-primary-200/20 rounded-full top-[30%] left-[45%]" style={{ animationDelay: '4s' }} />
        </div>

        {/* Hero pattern overlay */}
        <div className="absolute inset-0 hero-pattern opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="flex justify-center mb-6 animate-fadeInUp">
            <div className="hero-icon-pulse rounded-full">
              <img src="/logo.png" alt="Dumlupınar İlkokulu Logosu" className="w-24 h-24 rounded-full object-cover border-2 border-white/30 shadow-lg" />
            </div>
          </div>
          <h1
            className="text-3xl md:text-6xl font-bold mb-4 leading-tight animate-fadeInUp"
            style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}
          >
            Dumlupınar İlkokulu
          </h1>
          <p className="text-xl md:text-2xl text-primary-200 mb-2 font-medium animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Geleceğe Birlikte Yatırım Yapalım
          </p>
          <p className="text-sm text-primary-300 max-w-xl mx-auto mb-6 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            Birecik, Şanlıurfa
          </p>
          <p className="text-primary-100 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            Birecik'in kalbindeki okulumuzun öğrencileri, daha iyi bir eğitim ortamı için
            sizin desteğinize ihtiyaç duyuyor. Her katkı, bir çocuğun hayatında fark yaratır.
          </p>
          <a
            href="#ihtiyaclar"
            className="cta-btn cta-pulse-ring inline-flex items-center gap-2 px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-2xl text-lg transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/30 hover:scale-105 hover:-translate-y-1 animate-fadeInUp"
            style={{ animationDelay: '500ms' }}
          >
            <Heart className="w-5 h-5 cta-heartbeat" />
            Destek Ol
          </a>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </header>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="text-center mb-10 animate-fadeInUp">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 px-4 py-1.5 rounded-full mb-3">3 Kolay Adım</span>
            <h2
              className="text-2xl md:text-3xl font-bold text-gray-800"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Nasıl Çalışır?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
            {/* Connector lines - desktop only */}
            {steps.slice(0, -1).map((s, i) => (
              <div
                key={`line-${i}`}
                className="hidden md:block absolute top-12 z-0"
                style={{ left: `${(i + 1) * 33.33 - 8}%`, width: '16%' }}
              >
                <div className={`h-[2px] bg-gradient-to-r ${stepColors[s.color].line} opacity-40`} />
                <ArrowRight className="w-4 h-4 text-gray-300 absolute -right-2 -top-[7px]" />
              </div>
            ))}

            {steps.map((s, i) => {
              const colors = stepColors[s.color]
              return (
                <div
                  key={s.step}
                  className="relative group animate-fadeInUp"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className={`relative text-center p-6 rounded-2xl border-2 border-transparent transition-all duration-500 hover:border-gray-100 hover:shadow-xl ${colors.glow} hover:-translate-y-1`}>
                    {/* Step number background */}
                    <div className="absolute -top-0 -right-0 w-16 h-16 rounded-full bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon */}
                    <div className="relative mx-auto mb-5">
                      <div className={`w-16 h-16 rounded-2xl ${colors.iconBgDefault} ${colors.iconTextDefault} flex items-center justify-center mx-auto transition-all duration-500 ${colors.iconBgHover} group-hover:text-white group-hover:shadow-lg group-hover:scale-110 group-hover:rounded-xl ring-4 ${colors.ring}`}>
                        <s.icon className="w-7 h-7" />
                      </div>
                      {/* Step number badge */}
                      <div className={`absolute -top-2 -right-2 w-7 h-7 ${colors.badge} text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-transform duration-300 group-hover:scale-110`}>
                        {s.step}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-gray-900 transition-colors">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors max-w-[240px] mx-auto">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Donation Items */}
      <NeedsSection items={items} loading={loading} error={error} />

      {/* Student Needs */}
      <StudentNeedsSection items={studentItems} loading={studentLoading} error={studentError} />

      {/* Donor Marquee */}
      <DonorMarquee />

      {/* Trust & Legal */}
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <TrustBanner />
        <LegalInfo />
      </section>

      {/* Footer */}
      <footer id="iletisim-footer" className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                  Dumlupınar İlkokulu
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Birecik'in kalbindeki okulumuz, daha iyi bir eğitim ortamı için sizin desteğinizi bekliyor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Hızlı Bağlantılar</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-gray-500 hover:text-primary-600 transition-colors">Anasayfa</Link>
                <Link to="/yasal-dayanak" className="block text-sm text-gray-500 hover:text-primary-600 transition-colors">Yasal Dayanak</Link>
                <Link to="/iletisim" className="block text-sm text-gray-500 hover:text-primary-600 transition-colors">İletişim</Link>
                <Link to="/sss" className="block text-sm text-gray-500 hover:text-primary-600 transition-colors">Sıkça Sorulan Sorular</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">İletişim</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Merkez Mah. Kale Altı Cad. No: 1, Birecik, Şanlıurfa</p>
                <p>(0414) 652 12 52</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 italic">
              "Her bağış, bir öğrencinin geleceğine yapılan yatırımdır."
            </p>
            <p className="text-sm text-gray-500">Dumlupınar İlkokulu — Birecik, Şanlıurfa</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NeedsSection({ items, loading, error }: { items: DonationItem[]; loading: boolean; error: string | null }) {
  return (
    <main id="ihtiyaclar" className="max-w-6xl mx-auto px-4 py-14 md:py-20 scroll-mt-20">
      {/* Section header */}
      <div className="text-center mb-12 animate-fadeInUp">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full mb-4">
          Destek Bekleyen Kalemler
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Okulumuzun İhtiyaçları
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Her kalemin arkasında bir hikaye, her bağışın arkasında bir umut var. Hangi ihtiyaca destek olmak istersiniz?
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 bg-red-50 rounded-2xl">
          <p className="text-red-600 font-medium">Veriler yüklenirken bir sorun oluştu.</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
            Sayfayı Yenile
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-primary-300" />
          </div>
          <p className="text-gray-700 font-semibold text-xl">Tüm ihtiyaçlarımız karşılanmış durumda!</p>
          <p className="text-gray-500 max-w-md mx-auto">
            Destekleriniz için teşekkür ederiz. Yeni ihtiyaçlar için sayfamızı takip etmeye devam edin.
          </p>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((item, index) => (
          <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 80}ms` }}>
            <DonationCard item={item} />
          </div>
        ))}
      </div>
    </main>
  )
}

function StudentNeedsSection({ items, loading, error }: { items: StudentNeed[]; loading: boolean; error: string | null }) {
  return (
    <section id="ogrenci-ihtiyaclari" className="max-w-6xl mx-auto px-4 py-14 md:py-20 scroll-mt-20">
      {/* Section header */}
      <div className="text-center mb-12 animate-fadeInUp">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
          Bir Öğrencinin Hayatına Dokunun
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Öğrenci İhtiyaçları
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Öğrencilerimizin bireysel ihtiyaçlarına destek olarak onların eğitim yolculuğuna katkıda bulunun.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 bg-red-50 rounded-2xl">
          <p className="text-red-600 font-medium">Veriler yüklenirken bir sorun oluştu.</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
            Sayfayı Yenile
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-indigo-300" />
          </div>
          <p className="text-gray-700 font-semibold text-xl">Tüm öğrenci ihtiyaçları karşılanmış durumda!</p>
          <p className="text-gray-500 max-w-md mx-auto">
            Destekleriniz için teşekkür ederiz. Yeni ihtiyaçlar için sayfamızı takip etmeye devam edin.
          </p>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((item, index) => (
          <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 80}ms` }}>
            <StudentNeedCard item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}
