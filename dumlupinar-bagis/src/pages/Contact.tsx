import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Phone, Mail, Send, ArrowLeft, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'

export default function Contact() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // No backend yet - just show success
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{t('contact.title')} - Dumlupınar İlkokulu</title>
        <meta name="description" content={t('contact.meta_desc')} />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-24 pb-12 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-64 h-64 bg-white/5 rounded-full -top-16 -left-16 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-accent-500/10 rounded-full -bottom-10 right-1/4 blur-xl" style={{ animationDelay: '3s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-white/20 rounded-full top-[40%] left-[80%]" style={{ animationDelay: '1s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/15 rounded-full top-[20%] left-[30%]" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 animate-fadeInUp">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <Mail className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fadeInUp" style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}>
            {t('contact.title')}
          </h1>
          <p className="text-primary-200 max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {t('contact.subtitle')}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('contact.info_title')}
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('contact.org_name')}</h3>
                  <p className="text-gray-600 text-sm mt-1">{t('home.school_full_name')}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('contact.address')}</h3>
                  <p className="text-gray-600 text-sm mt-1">Merkez Mah. Kale Altı Cad. No: 1, Birecik, Şanlıurfa</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('contact.phone')}</h3>
                  <p className="text-gray-600 text-sm mt-1">(0414) 652 12 52</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('contact.email')}</h3>
                  <p className="text-gray-600 text-sm mt-1">741585@meb.k12.tr</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-xl h-48 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('contact.map_coming')}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('contact.form_title')}
            </h2>

            {submitted ? (
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center animate-fadeInUp">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-primary-800 text-lg mb-2">{t('contact.form_success_title')}</h3>
                <p className="text-primary-600 text-sm">
                  {t('contact.form_success_desc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('contact.form_name')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    placeholder={t('contact.form_name')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('contact.form_email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('contact.form_message')}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
                    placeholder={t('contact.form_placeholder')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  {t('contact.form_submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('contact.back_home')}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center space-y-2">
          <p className="text-sm text-gray-500">{t('home.school_full_name')} — Birecik, Şanlıurfa</p>
          <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">
            {t('nav.admin')}
          </Link>
        </div>
      </footer>
    </div>
  )
}
