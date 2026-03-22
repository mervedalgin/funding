import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Heart, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.legal'), href: '/yasal-dayanak' },
    { label: t('nav.donors'), href: '/bagiscilarimiz' },
    { label: t('nav.contact'), href: '/iletisim' },
    { label: t('nav.faq'), href: '/sss' },
  ]

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr'
    i18n.changeLanguage(newLang)
    document.documentElement.lang = newLang
  }

  // Only use transparent mode on homepage
  const isHomePage = location.pathname === '/'
  const showDark = scrolled || menuOpen || !isHomePage

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.slice(2)
      if (location.pathname === '/') {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          setMenuOpen(false)
          return
        }
      }
    }
    setMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showDark
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Dumlupınar İlkokulu Logosu"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span
            className={`font-bold text-lg transition-colors ${
              showDark ? 'text-gray-800' : 'text-white'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Dumlupınar İlkokulu
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isAnchor = link.href.startsWith('/#')
            const isActive = isAnchor
              ? location.pathname === '/'
              : location.pathname === link.href

            return isAnchor ? (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showDark
                    ? isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    : isActive
                      ? 'text-white bg-white/15'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showDark
                    ? isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    : isActive
                      ? 'text-white bg-white/15'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          <button
            onClick={toggleLanguage}
            className={`ml-1 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              showDark
                ? 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title={i18n.language === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
          >
            <Globe className="w-4 h-4" />
            {i18n.language === 'tr' ? 'EN' : 'TR'}
          </button>

          <Link
            to="/#ihtiyaclar"
            onClick={() => handleNavClick('/#ihtiyaclar')}
            className="cta-btn cta-pulse-ring ml-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 hover:scale-105 hover:-translate-y-0.5 flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 cta-heartbeat" />
            {t('nav.donate')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            showDark
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-white hover:bg-white/10'
          }`}
          aria-label="Menü"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeInUp">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isAnchor = link.href.startsWith('/#')
              return isAnchor ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={toggleLanguage}
              className="w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {i18n.language === 'tr' ? 'English' : 'Türkçe'}
            </button>
            <Link
              to="/#ihtiyaclar"
              onClick={() => handleNavClick('/#ihtiyaclar')}
              className="cta-btn block mt-2 px-4 py-3 bg-accent-500 hover:bg-accent-600 text-white text-center font-semibold rounded-xl transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 cta-heartbeat" />
                {t('nav.donate')}
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
