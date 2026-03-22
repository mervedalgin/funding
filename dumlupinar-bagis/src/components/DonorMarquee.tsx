import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDonations } from '../hooks/useDonations'
import { formatCurrency } from '../lib/formatters'

function DonorItem({ donor }: { donor: { name: string; amount: number } }) {
  return (
    <Link
      to="/bagiscilarimiz"
      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white/90 whitespace-nowrap rounded-lg hover:text-white hover:bg-white/10 transition-colors min-h-[44px]"
      aria-label={`${donor.name} bağışçı profilini görüntüle`}
    >
      <Heart className="w-3.5 h-3.5 text-red-300 fill-red-300 shrink-0" aria-hidden="true" />
      {donor.name}
      <span className="text-white/50 text-xs ml-0.5">{formatCurrency(donor.amount)}</span>
    </Link>
  )
}

export default function DonorMarquee() {
  const { fetchPublicDonorNames } = useDonations()
  const [donors, setDonors] = useState<{ name: string; amount: number }[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const CACHE_KEY = 'donor_marquee_cache'
    const CACHE_TTL = 5 * 60 * 1000

    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL && Array.isArray(data) && data.length > 0) {
          setDonors(data)
          setLoaded(true)
          return
        }
      } catch { /* ignore corrupt cache */ }
    }

    fetchPublicDonorNames().then(data => {
      setDonors(data)
      setLoaded(true)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
    }).catch(() => setLoaded(true))
  }, [fetchPublicDonorNames])

  // Don't render if no donors
  if (loaded && donors.length === 0) return null
  // Don't render while loading (prevents layout shift)
  if (!loaded) return null

  return (
    <section
      aria-label="Bağışçılarımız kayan listesi"
      className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 py-4"
    >
      <h2 className="sr-only">Son Bağışçılar</h2>
      <div className="flex items-center" role="marquee">
        <div className="flex items-center gap-3 px-4 shrink-0 border-r border-white/20 mr-4">
          <Heart className="w-5 h-5 text-accent-400 fill-accent-400" aria-hidden="true" />
          <span className="text-white font-semibold text-sm whitespace-nowrap">
            Bağışçılarımız
            <span className="text-white/50 ml-1.5 font-normal">({donors.length})</span>
          </span>
        </div>
        <div className="marquee-container flex-1 overflow-hidden">
          <div className="marquee-track">
            {donors.map((donor, i) => (
              <DonorItem key={`a-${i}`} donor={donor} />
            ))}
            {donors.map((donor, i) => (
              <DonorItem key={`b-${i}`} donor={donor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
