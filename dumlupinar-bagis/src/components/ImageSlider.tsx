import { useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X as XIcon, ZoomIn } from 'lucide-react'

interface ImageSliderProps {
  images: string[]
  alt?: string
}

export default function ImageSlider({ images, alt = 'Galeri görseli' }: ImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1))
    setActiveIndex(clamped)
    scrollRef.current?.children[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [images.length])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const scrollLeft = el.scrollLeft
    const width = el.clientWidth
    const newIndex = Math.round(scrollLeft / width)
    if (newIndex !== activeIndex) setActiveIndex(newIndex)
  }

  if (images.length === 0) return null

  return (
    <>
      <div className="space-y-3">
        {/* Slider */}
        <div className="relative group rounded-2xl overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((src, i) => (
              <div key={i} className="snap-center shrink-0 w-full">
                <img
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer"
                  onClick={() => { setActiveIndex(i); setLightboxOpen(true) }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => scrollTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => scrollTo(activeIndex + 1)}
                disabled={activeIndex === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-primary-500 w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Görsel ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
          >
            <XIcon className="w-6 h-6 text-white" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); scrollTo(activeIndex - 1) }}
                disabled={activeIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-0 min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); scrollTo(activeIndex + 1) }}
                disabled={activeIndex === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-0 min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <img
            src={images[activeIndex]}
            alt={`${alt} ${activeIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
