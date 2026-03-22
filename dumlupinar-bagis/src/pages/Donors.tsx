import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart, Users, X, Calendar, Gift } from 'lucide-react'
import Navbar from '../components/Navbar'
import { formatCurrency, formatRelativeTime } from '../lib/formatters'

interface Donor {
  id: string
  donor_name: string
  amount: number
  item_title: string
  created_at: string
}

const mockDonors: Donor[] = [
  { id: '1', donor_name: 'Ahmet B.', amount: 15000, item_title: 'Akıllı Tahta', created_at: '2026-03-15' },
  { id: '2', donor_name: 'Fatma K.', amount: 8500, item_title: 'Projeksiyon Cihazı', created_at: '2026-03-14' },
  { id: '3', donor_name: 'Mehmet Y.', amount: 25000, item_title: 'Bilgisayar Seti', created_at: '2026-03-12' },
  { id: '4', donor_name: 'Ayşe D.', amount: 3000, item_title: 'Kütüphane Kitapları', created_at: '2026-03-10' },
  { id: '5', donor_name: 'Ali R.', amount: 12000, item_title: 'Akıllı Tahta', created_at: '2026-03-08' },
  { id: '6', donor_name: 'Zeynep S.', amount: 5000, item_title: 'Spor Malzemeleri', created_at: '2026-03-06' },
  { id: '7', donor_name: 'Mustafa T.', amount: 20000, item_title: 'Bilgisayar Seti', created_at: '2026-03-04' },
  { id: '8', donor_name: 'Emine A.', amount: 7500, item_title: 'Projeksiyon Cihazı', created_at: '2026-03-02' },
]

const avatarGradients = [
  'from-teal-400 to-teal-600',
  'from-amber-400 to-amber-600',
  'from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-amber-400 to-yellow-500',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-amber-600',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Donors() {
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>Bağışçılarımız - Dumlupınar İlkokulu</title>
        <meta name="description" content="Dumlupınar İlkokulu'na destek olan tüm bağışçılarımız. Her bağış, bir çocuğun geleceğine yapılan yatırımdır." />
        <meta property="og:title" content="Bağışçılarımız - Dumlupınar İlkokulu" />
        <meta property="og:description" content="Okulumuza destek olan tüm hayırseverler." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bağışçılarımız - Dumlupınar İlkokulu" />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-24 pb-12 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-72 h-72 bg-white/5 rounded-full -top-20 -left-20 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-96 h-96 bg-accent-500/10 rounded-full -bottom-32 -right-32 blur-2xl" style={{ animationDelay: '2s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-primary-300/10 rounded-full top-1/3 right-1/4 blur-xl" style={{ animationDelay: '4s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-white/20 rounded-full top-[20%] left-[15%]" style={{ animationDelay: '0s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/15 rounded-full top-[60%] left-[80%]" style={{ animationDelay: '1.5s' }} />
          <div className="hero-particle absolute w-2.5 h-2.5 bg-accent-300/20 rounded-full top-[40%] left-[60%]" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 animate-fadeInUp">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <Users className="w-7 h-7" />
            </div>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3 animate-fadeInUp"
            style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}
          >
            Bağışçılarımız
          </h1>
          <p className="text-primary-200 max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Okulumuza destek olan tüm hayırseverler
          </p>
        </div>
      </header>

      {/* Donor Cards Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-500" />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-gray-800"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Destekçilerimiz
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {mockDonors.map((donor, index) => (
            <button
              key={donor.id}
              id={`donor-${donor.id}`}
              type="button"
              onClick={() => setSelectedDonor(donor)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-5 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fadeInUp min-h-[44px] scroll-mt-24"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {getInitials(donor.donor_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{donor.donor_name}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(donor.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">{formatCurrency(donor.amount)}</span>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg truncate max-w-[120px]">{donor.item_title}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Donor Detail Modal */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Bağışçı detayı">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-200"
            onClick={() => setSelectedDonor(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fadeInUp">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-2xl p-6 text-center text-white relative">
              <button
                onClick={() => setSelectedDonor(null)}
                aria-label="Kapat"
                className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradients[mockDonors.findIndex((d) => d.id === selectedDonor.id) % avatarGradients.length]} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 ring-4 ring-white/30`}>
                {getInitials(selectedDonor.donor_name)}
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {selectedDonor.donor_name}
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Donation info */}
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-sm text-primary-700 mb-1">
                  <span className="font-semibold">{selectedDonor.item_title}</span> kalemi için
                </p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(selectedDonor.amount)}</p>
                <p className="text-sm text-primary-500 mt-1">bağış yaptı</p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Bağış Tarihi</p>
                  <p>{new Date(selectedDonor.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} ({formatRelativeTime(selectedDonor.created_at)})</p>
                </div>
              </div>

              {/* Item */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Bağış Kalemi</p>
                  <p>{selectedDonor.item_title}</p>
                </div>
              </div>

              {/* Thank you message */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Değerli bağışçımız <span className="font-semibold">{selectedDonor.donor_name}</span>, okulumuz adına katkılarınız için çok teşekkür ederiz.
                    Desteğiniz öğrencilerimizin daha iyi bir eğitim almasına katkı sağlıyor.
                    Her bağış, bir çocuğun geleceğine yapılan yatırımdır.
                  </p>
                </div>
              </div>

              {/* Badge */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent-400 to-accent-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  <Heart className="w-4 h-4" />
                  Teşekkürler!
                </span>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedDonor(null)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors min-h-[44px]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
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
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">İletişim</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Dumlupınar Mahallesi, Birecik, Şanlıurfa</p>
                <p>(0414) 652 00 00</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 italic">
              "Her bağış, bir öğrencinin geleceğine yapılan yatırımdır."
            </p>
            <p className="text-sm text-gray-500">Dumlupınar İlkokulu ve Ortaokulu — Birecik, Şanlıurfa</p>
            <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">
              Yönetim
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
