import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SearchX } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Sayfa Bulunamadı - Dumlupınar İlkokulu</title>
      </Helmet>

      <Navbar />

      {/* Animated hero background */}
      <div className="relative overflow-hidden flex-1 flex items-center justify-center px-4 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-64 h-64 bg-white/5 rounded-full -top-16 -left-16 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-white/5 rounded-full -bottom-10 -right-10 blur-xl" style={{ animationDelay: '2s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-white/20 rounded-full top-[30%] left-[25%]" style={{ animationDelay: '0s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/15 rounded-full top-[50%] left-[70%]" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />

        <div className="relative text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto border border-white/20 hero-icon-pulse animate-fadeInUp">
            <SearchX className="w-10 h-10 text-white" />
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h1 className="text-6xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              404
            </h1>
            <p className="text-lg text-primary-100 font-medium">
              Aradığınız sayfa bulunamadı
            </p>
            <p className="text-primary-200 mt-2">
              Bu sayfa kaldırılmış veya taşınmış olabilir.
            </p>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-medium hover:bg-primary-50 transition-colors min-h-[44px] shadow-lg"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
