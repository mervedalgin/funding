import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, MessageCircle, Search, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useFaq } from '../hooks/useFaq'

function AccordionCard({ question, answer, isOpen, onToggle, index }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={`bg-white rounded-2xl border transition-all duration-500 overflow-hidden ${
          isOpen
            ? 'border-primary-200 shadow-lg shadow-primary-500/5 ring-1 ring-primary-100'
            : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left min-h-[64px] group"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-110'
                : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
            }`}>
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className={`font-semibold text-base md:text-lg transition-colors duration-300 ${
              isOpen ? 'text-primary-700' : 'text-gray-800 group-hover:text-primary-600'
            }`}>
              {question}
            </h3>
          </div>
          <ChevronDown className={`w-5 h-5 shrink-0 transition-all duration-500 ${
            isOpen ? 'rotate-180 text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
          }`} />
        </button>

        <div
          className={`transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
            <div className="pl-14 border-l-2 border-primary-100 ml-0.5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const { items, loading } = useFaq()
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category))
    return ['tümü', ...Array.from(cats)]
  }, [items])

  const [activeCategory, setActiveCategory] = useState('tümü')

  const filtered = useMemo(() => {
    let result = items
    if (activeCategory !== 'tümü') {
      result = result.filter(i => i.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q)
      )
    }
    return result
  }, [items, activeCategory, search])

  const toggle = (id: string) => {
    setOpenId(prev => prev === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Sıkça Sorulan Sorular - Dumlupınar İlkokulu</title>
        <meta name="description" content="Dumlupınar İlkokulu bağış platformu hakkında sıkça sorulan sorular ve cevapları." />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden text-white pt-20 pb-12 hero-animated-bg">
        <div className="absolute inset-0 hero-gradient-animate" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-float-shape absolute w-64 h-64 bg-white/5 rounded-full -top-16 -right-16 blur-xl" style={{ animationDelay: '0s' }} />
          <div className="hero-float-shape absolute w-48 h-48 bg-accent-500/8 rounded-full bottom-0 left-1/4 blur-xl" style={{ animationDelay: '2s' }} />
          <div className="hero-particle absolute w-2 h-2 bg-white/20 rounded-full top-[30%] left-[20%]" style={{ animationDelay: '1s' }} />
          <div className="hero-particle absolute w-1.5 h-1.5 bg-white/15 rounded-full top-[50%] left-[70%]" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 animate-fadeInUp">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hero-icon-pulse">
              <HelpCircle className="w-8 h-8" />
            </div>
          </div>
          <h1
            className="text-3xl md:text-5xl font-bold mb-3 animate-fadeInUp"
            style={{ fontFamily: 'var(--font-heading)', animationDelay: '100ms' }}
          >
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Bağış süreciyle ilgili merak ettiklerinizin cevaplarını burada bulabilirsiniz
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 -mt-6 relative z-10 pb-16">

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-8 animate-fadeInUp">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sorunuzu arayın..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${
                  activeCategory === cat
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-shimmer h-20" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-primary-300" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">
              {search ? 'Aramanızla eşleşen soru bulunamadı' : 'Henüz soru eklenmemiş'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {search ? 'Farklı bir arama terimi deneyin' : 'Yakında sorular eklenecektir'}
            </p>
          </div>
        )}

        {/* Accordion list */}
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <AccordionCard
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
              index={index}
            />
          ))}
        </div>

        {/* Contact CTA */}
        {!loading && items.length > 0 && (
          <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <p className="text-gray-500 text-sm mb-3">Aradığınız cevabı bulamadınız mı?</p>
            <Link
              to="/iletisim"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 hover:shadow-md transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              Bize Ulaşın
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
