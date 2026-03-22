import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Scale, FileText, BookOpen, ShieldCheck, ArrowLeft, ExternalLink,
  Landmark, Gavel, ScrollText, BadgeCheck, Building2, FileCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLegalBasis } from '../hooks/useLegalBasis'

const ICON_MAP: Record<string, LucideIcon> = {
  'scale': Scale,
  'file-text': FileText,
  'book-open': BookOpen,
  'shield-check': ShieldCheck,
  'landmark': Landmark,
  'gavel': Gavel,
  'scroll-text': ScrollText,
  'badge-check': BadgeCheck,
  'building-2': Building2,
  'file-check': FileCheck,
}

export default function LegalBasis() {
  const { items, loading, error } = useLegalBasis()

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>Yasal Dayanak - Dumlupınar İlkokulu</title>
        <meta name="description" content="Dumlupınar İlkokulu bağış toplama faaliyetlerinin yasal dayanakları." />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-24 pb-12 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-72 h-72 bg-white/5 rounded-full -top-20 -right-20 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-primary-300/10 rounded-full bottom-0 left-1/4 blur-xl" style={{ animationDelay: '2s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-white/20 rounded-full top-[30%] left-[20%]" style={{ animationDelay: '0s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/15 rounded-full top-[60%] left-[70%]" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 animate-fadeInUp">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <Scale className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fadeInUp" style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}>
            Yasal Dayanak
          </h1>
          <p className="text-primary-200 max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Bağış toplama faaliyetlerimiz, T.C. Milli Eğitim Bakanlığı mevzuatı ve ilgili kanunlar kapsamında yürütülmektedir.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Yasal dayanak bilgileri yakında eklenecek.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, i) => {
              const IconComp = ICON_MAP[item.icon_name] || Scale
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 animate-fadeInUp"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <IconComp className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h2>
                      <div
                        className="prose prose-sm max-w-none text-gray-600 leading-relaxed
                          prose-headings:text-gray-800 prose-headings:font-bold
                          prose-a:text-primary-600 prose-a:underline
                          prose-ul:list-disc prose-ol:list-decimal
                          prose-li:text-gray-600"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Mevzuatı Görüntüle
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-10 bg-primary-50 border border-primary-100 rounded-2xl p-6 md:p-8">
          <h3 className="font-bold text-primary-800 mb-3">Bağışlarınız Nereye Gidiyor?</h3>
          <p className="text-primary-700 leading-relaxed text-sm">
            Tüm bağışlar, Dumlupınar İlkokulu Okul Aile Birliği'nin resmi banka hesabına yatırılmaktadır.
            Toplanan bağışlar, okul yönetimi ve okul aile birliği ortak kararıyla, okulun ihtiyaçları
            doğrultusunda harcanmaktadır. Harcamalar düzenli olarak raporlanır ve şeffaf bir şekilde paylaşılır.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Anasayfaya Dön
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center space-y-2">
          <p className="text-sm text-gray-500">Dumlupınar İlkokulu — Birecik, Şanlıurfa</p>
          <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">
            Yönetim
          </Link>
        </div>
      </footer>
    </div>
  )
}
