import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart, Users, X, Calendar, Gift, Loader2, Package, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import { useDonations } from '../hooks/useDonations'
import type { PublicDonorUnified } from '../types/donation'
import { formatCurrency, formatRelativeTime } from '../lib/formatters'

type DonorFilter = 'all' | 'school' | 'student'

const avatarGradients = [
  'from-teal-400 to-teal-600', 'from-amber-400 to-amber-600',
  'from-teal-500 to-emerald-600', 'from-amber-500 to-orange-500',
  'from-teal-400 to-cyan-500', 'from-amber-400 to-yellow-500',
  'from-emerald-400 to-teal-600', 'from-orange-400 to-amber-600',
]

export default function Donors() {
  const { t } = useTranslation()
  const { fetchAllPublicDonors } = useDonations()
  const [donors, setDonors] = useState<PublicDonorUnified[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<DonorFilter>('all')
  const [selectedDonor, setSelectedDonor] = useState<PublicDonorUnified | null>(null)

  useEffect(() => {
    fetchAllPublicDonors().then(data => { setDonors(data); setLoading(false) }).catch(() => setLoading(false))
  }, [fetchAllPublicDonors])

  const filtered = useMemo(() => {
    if (filter === 'all') return donors
    return donors.filter(d => d.type === filter)
  }, [donors, filter])

  const totalAmount = useMemo(() => donors.reduce((s, d) => s + d.amount, 0), [donors])
  const schoolCount = donors.filter(d => d.type === 'school').length
  const studentCount = donors.filter(d => d.type === 'student').length

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{t('donors.title')} - Dumlupınar İlkokulu</title>
        <meta name="description" content={t('donors.meta_desc')} />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-24 pb-12 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-72 h-72 bg-white/5 rounded-full -top-20 -left-20 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-96 h-96 bg-accent-500/10 rounded-full -bottom-32 -right-32 blur-2xl" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 animate-fadeInUp">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <Users className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fadeInUp" style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}>
            {t('donors.title')}
          </h1>
          <p className="text-primary-200 max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {t('donors.subtitle')}
          </p>

          {/* Stats */}
          {donors.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-6 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{donors.length}</p>
                <p className="text-xs text-primary-200">Bağışçı</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-primary-200">Toplam Bağış</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Header + Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('donors.supporters')}
            </h2>
          </div>

          {/* Filter tabs */}
          {donors.length > 0 && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                Tümü <span className="text-xs text-gray-400">({donors.length})</span>
              </button>
              <button onClick={() => setFilter('school')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filter === 'school' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Package className="w-3.5 h-3.5" /> Okul <span className="text-xs text-gray-400">({schoolCount})</span>
              </button>
              <button onClick={() => setFilter('student')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filter === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <GraduationCap className="w-3.5 h-3.5" /> Öğrenci <span className="text-xs text-gray-400">({studentCount})</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Henüz bağışçı bulunmuyor.</p>
            <Link to="/#ihtiyaclar" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-4">
              <Heart className="w-4 h-4" /> İlk bağışçı sen ol!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((donor, index) => (
              <button
                key={`${donor.type}-${index}`}
                type="button"
                onClick={() => setSelectedDonor(donor)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-5 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fadeInUp min-h-[44px]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{donor.donor_name}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(donor.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(donor.amount)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md ${
                      donor.type === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary-50 text-primary-600'
                    }`}>
                      {donor.type === 'student' ? 'Öğrenci Bağışı' : 'Okul Bağışı'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 truncate">{donor.item_title}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Donor Detail Modal */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedDonor(null)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fadeInUp">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-2xl p-6 text-center text-white relative">
              <button onClick={() => setSelectedDonor(null)} aria-label={t('donors.close')}
                className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradients[filtered.findIndex(d => d === selectedDonor) % avatarGradients.length]} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 ring-4 ring-white/30`}>
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{selectedDonor.donor_name}</h3>
              <span className={`inline-block mt-2 text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
                selectedDonor.type === 'student' ? 'bg-indigo-400/30 text-indigo-100' : 'bg-white/20 text-white'
              }`}>
                {selectedDonor.type === 'student' ? 'Öğrenci Bağışı' : 'Okul Bağışı'}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-sm text-primary-700 mb-1">
                  <span className="font-semibold">{selectedDonor.item_title}</span> {t('donors.donated_for')}
                </p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(selectedDonor.amount)}</p>
                <p className="text-sm text-primary-500 mt-1">{t('donors.donated')}</p>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">{t('donors.donation_date')}</p>
                  <p>{new Date(selectedDonor.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} ({formatRelativeTime(selectedDonor.created_at)})</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">{t('donors.donation_item')}</p>
                  <p>{selectedDonor.item_title}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {t('donors.thank_message', { name: selectedDonor.donor_name })}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent-400 to-accent-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  <Heart className="w-4 h-4" /> {t('donors.thanks')}
                </span>
              </div>

              <button onClick={() => setSelectedDonor(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors min-h-[44px]">
                {t('donors.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center space-y-2">
          <p className="text-sm text-gray-600 italic">"{t('home.footer_quote')}"</p>
          <p className="text-sm text-gray-500">{t('home.school_full_name')} — Birecik, Şanlıurfa</p>
        </div>
      </footer>
    </div>
  )
}
