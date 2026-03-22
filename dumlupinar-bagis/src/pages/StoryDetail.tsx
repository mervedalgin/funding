import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Calendar, Heart, TrendingUp, Users, BookHeart, ExternalLink } from 'lucide-react'
import Navbar from '../components/Navbar'
import ImageSlider from '../components/ImageSlider'
import SocialShare from '../components/SocialShare'
import { useStories, estimateReadingTime } from '../hooks/useStories'
import { formatCurrency } from '../lib/formatters'
import { getOptimizedImageUrl } from '../lib/imageUtils'
import type { DonationStory } from '../types/donation'

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { items, fetchStory, incrementViewCount } = useStories()
  const [story, setStory] = useState<DonationStory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      const data = await fetchStory(slug)
      if (data) {
        setStory(data)
        incrementViewCount(data.id)
      }
      setLoading(false)
    }
    load()
  }, [slug, fetchStory, incrementViewCount])

  // Related stories (same tags, max 3)
  const related = story
    ? items.filter(s => s.id !== story.id && s.tags.some(t => story.tags.includes(t))).slice(0, 3)
    : []

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 space-y-4">
          <div className="h-64 rounded-2xl animate-shimmer" />
          <div className="h-8 w-2/3 rounded animate-shimmer" />
          <div className="h-4 w-full rounded animate-shimmer" />
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <BookHeart className="w-16 h-16 text-gray-200" />
          <p className="text-gray-500 text-lg">Hikaye bulunamadı.</p>
          <Link to="/bagis-hikayeleri" className="text-primary-600 hover:underline font-medium">Tüm Hikayelere Dön</Link>
        </div>
      </div>
    )
  }

  const readingTime = estimateReadingTime(story.content)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{story.title} - Bağış Hikayeleri | Dumlupınar İlkokulu</title>
        <meta name="description" content={story.summary ?? `${story.title} — Dumlupınar İlkokulu bağış hikayesi.`} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.summary ?? story.title} />
        <meta property="og:type" content="article" />
        {story.cover_image_url && <meta property="og:image" content={story.cover_image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": story.title,
          "description": story.summary,
          "image": story.cover_image_url,
          "datePublished": story.created_at,
          "dateModified": story.updated_at,
          "publisher": { "@type": "EducationalOrganization", "name": "Dumlupınar İlkokulu" },
        })}</script>
      </Helmet>

      <Navbar />

      {/* Cover Hero */}
      <header className="relative pt-16">
        {story.cover_image_url ? (
          <div className="relative h-64 sm:h-80 md:h-96">
            <img
              src={getOptimizedImageUrl(story.cover_image_url, 1200, 600) ?? story.cover_image_url}
              alt={story.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {story.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                {story.completed_at && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(story.completed_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                )}
                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{readingTime} dk okuma</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 pt-8 pb-12 text-white">
            <div className="max-w-4xl mx-auto px-4">
              <h1 className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{story.title}</h1>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link to="/bagis-hikayeleri" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors min-h-[44px] p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" /> Tüm Hikayeler
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-10 space-y-8">
            {/* Meta band */}
            {(story.donation_amount || story.impact_text || story.donation_item_id) && (
              <div className="flex flex-wrap gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                {story.donation_amount && (
                  <div className="text-center px-4">
                    <p className="text-xs text-primary-500 uppercase tracking-wider font-medium">Bağış Tutarı</p>
                    <p className="text-xl font-bold text-primary-700">{formatCurrency(story.donation_amount)}</p>
                  </div>
                )}
                {story.impact_text && (
                  <div className="flex-1 min-w-0 px-4 border-l border-primary-200">
                    <p className="text-xs text-primary-500 uppercase tracking-wider font-medium">Etki</p>
                    <p className="text-sm text-primary-700 font-medium">{story.impact_text}</p>
                  </div>
                )}
                {story.completed_at && (
                  <div className="px-4 border-l border-primary-200">
                    <p className="text-xs text-primary-500 uppercase tracking-wider font-medium">Tamamlanma</p>
                    <p className="text-sm text-primary-700 font-medium">{new Date(story.completed_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                )}
                {story.donation_item_id && (
                  <div className="px-4 border-l border-primary-200">
                    <p className="text-xs text-primary-500 uppercase tracking-wider font-medium">Bağışçılar</p>
                    <Link to={`/item/${story.donation_item_id}`} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium">
                      <Users className="w-4 h-4" /> Bağış Detayı <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {story.summary && (
              <blockquote className="text-lg text-gray-600 italic border-l-4 border-primary-300 pl-4 py-1">
                {story.summary}
              </blockquote>
            )}

            {/* Body */}
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                prose-headings:text-gray-800 prose-headings:font-bold
                prose-a:text-primary-600 prose-a:underline
                prose-ul:list-disc prose-ol:list-decimal
                prose-li:text-gray-700
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            {/* Gallery slider */}
            {story.gallery_images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Galeri</h3>
                <ImageSlider images={story.gallery_images} alt={story.title} />
              </div>
            )}

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {story.tags.map(tag => (
                  <Link key={tag} to={`/bagis-hikayeleri`} className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-medium hover:bg-primary-100 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Social share */}
            <div className="pt-6 border-t border-gray-100">
              <SocialShare url={pageUrl} title={story.title} description={story.summary ?? undefined} />
            </div>
          </div>
        </article>

        {/* Related stories */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-800 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>İlgili Hikayeler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(s => (
                <Link key={s.id} to={`/bagis-hikayeleri/${s.slug}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  {s.cover_image_url ? (
                    <img src={getOptimizedImageUrl(s.cover_image_url, 400, 300) ?? s.cover_image_url} alt={s.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <BookHeart className="w-10 h-10 text-primary-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-2">{s.title}</h3>
                    {s.summary && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.summary}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Bir Hikayede Sen Yaz!</h2>
          <p className="text-accent-100 mb-6 text-sm max-w-md mx-auto">Her bağış bir hikaye yaratır. Okulumuzun ihtiyaçlarına destek olarak sen de bu hikayelerin bir parçası ol.</p>
          <Link to="/#ihtiyaclar" className="inline-flex items-center gap-2 bg-white text-accent-700 px-6 py-3 rounded-xl font-bold hover:bg-accent-50 transition-all min-h-[44px]">
            <Heart className="w-5 h-5" /> Destek Ol
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Dumlupınar İlkokulu — Birecik, Şanlıurfa</p>
        </div>
      </footer>
    </div>
  )
}
