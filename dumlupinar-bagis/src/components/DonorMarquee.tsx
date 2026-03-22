import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

// NOTE: When donor data comes from Supabase, sanitize donor names before rendering
// to prevent XSS (e.g. use DOMPurify or ensure server-side sanitization).
const donors = [
  { id: '1', name: 'Ahmet B.' },
  { id: '2', name: 'Fatma K.' },
  { id: '3', name: 'Mehmet Y.' },
  { id: '4', name: 'Ayşe D.' },
  { id: '5', name: 'Ali R.' },
  { id: '6', name: 'Zeynep S.' },
  { id: '7', name: 'Mustafa T.' },
  { id: '8', name: 'Emine A.' },
]

function DonorItem({ donor }: { donor: { id: string; name: string } }) {
  return (
    <Link
      to={`/bagiscilarimiz#donor-${donor.id}`}
      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white/90 whitespace-nowrap rounded-lg hover:text-white hover:bg-white/10 transition-colors min-h-[44px]"
      aria-label={`${donor.name} bağışçı profilini görüntüle`}
    >
      <Heart className="w-3.5 h-3.5 text-red-300 fill-red-300 shrink-0" aria-hidden="true" />
      {donor.name}
    </Link>
  )
}

export default function DonorMarquee() {
  return (
    <section
      aria-label="Bağışçılarımız kayan listesi"
      className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 py-4"
    >
      <h2 className="sr-only">Son Bağışçılar</h2>
      <div className="flex items-center" role="marquee">
        <div className="flex items-center gap-3 px-4 shrink-0 border-r border-white/20 mr-4">
          <Heart className="w-5 h-5 text-accent-400 fill-accent-400" aria-hidden="true" />
          <span className="text-white font-semibold text-sm whitespace-nowrap">Bağışçılarımız</span>
        </div>
        <div className="marquee-container flex-1 overflow-hidden">
          <div className="marquee-track">
            {donors.map((donor) => (
              <DonorItem key={`a-${donor.id}`} donor={donor} />
            ))}
            {donors.map((donor) => (
              <DonorItem key={`b-${donor.id}`} donor={donor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
