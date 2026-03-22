import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { BookHeart, Heart, ArrowRight, Calendar, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import { useStories, estimateReadingTime } from '../hooks/useStories'
import { formatCurrency } from '../lib/formatters'
import { getOptimizedImageUrl } from '../lib/imageUtils'

export default function StoriesPage() {
  const { t } = useTranslation()
  const { items, loading } = useStories()
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    items.forEach(s => s.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [items])

  const filtered = useMemo(() => {
    if (!activeTag) return items
    return items.filter(s => s.tags.includes(activeTag))
  }, [items, activeTag])

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{t('stories.title')} - Dumlupınar İlkokulu</title>
        <meta name="description" content={t('stories.meta_desc')} />
        <meta property="og:title" content={`${t('stories.title')} - Dumlupınar İlkokulu`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-24 pb-12 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-72 h-72 bg-white/5 rounded-full -top-20 -right-20 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-accent-500/10 rounded-full bottom-0 left-1/4 blur-xl" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 animate-fadeInUp">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <BookHeart className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fadeInUp" style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}>
            {t('stories.title')}
          </h1>
          <p className="text-primary-200 max-w-xl mx-auto mb-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {t('stories.subtitle')}
          </p>

          {/* CTA */}
          <Link
            to="/#ihtiyaclar"
            className="cta-btn inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 hover:scale-105 animate-fadeInUp min-h-[44px]"
            style={{ animationDelay: '300ms' }}
          >
            <Heart className="w-5 h-5 cta-heartbeat" />
            {t('stories.cta_btn')}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                !activeTag ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              {t('stories.all')}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTag === tag ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-48 rounded-2xl animate-shimmer" />
                <div className="h-6 w-3/4 rounded animate-shimmer" />
                <div className="h-4 w-full rounded animate-shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t('stories.empty')}</p>
            <Link to="/#ihtiyaclar" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-4">
              <Heart className="w-4 h-4" /> {t('stories.cta_btn')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((story, i) => (
              <Link
                key={story.id}
                to={`/bagis-hikayeleri/${story.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Cover image */}
                <div className="relative overflow-hidden">
                  {story.cover_image_url ? (
                    <img
                      src={getOptimizedImageUrl(story.cover_image_url, 600, 400) ?? story.cover_image_url}
                      alt={story.title}
                      loading="lazy"
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <BookHeart className="w-12 h-12 text-primary-300" />
                    </div>
                  )}

                  {/* Amount badge */}
                  {story.donation_amount && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                      <span className="text-sm font-bold text-primary-700">{formatCurrency(story.donation_amount)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                    {story.title}
                  </h3>

                  {story.summary && (
                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{story.summary}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {story.completed_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(story.completed_at).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {estimateReadingTime(story.content)} dk okuma
                    </span>
                  </div>

                  {/* Tags */}
                  {story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {story.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Read more */}
                  <div className="flex items-center gap-1 text-primary-600 text-sm font-medium pt-1">
                    {t('stories.read_more')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('stories.footer_cta_title')}
          </h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">{t('stories.footer_cta_desc')}</p>
          <Link
            to="/#ihtiyaclar"
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-all duration-300 hover:shadow-lg min-h-[44px]"
          >
            <Heart className="w-5 h-5" />
            {t('stories.cta_btn')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center space-y-2">
          <p className="text-sm text-gray-500">Dumlupınar İlkokulu ve Ortaokulu — Birecik, Şanlıurfa</p>
        </div>
      </footer>
    </div>
  )
}
