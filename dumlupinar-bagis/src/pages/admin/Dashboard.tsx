import { useMemo } from 'react'
import { Package, HandCoins, GraduationCap, MessageCircle, Scale, CreditCard, Settings, ArrowRight } from 'lucide-react'
import { useDonationItems } from '../../hooks/useDonationItems'
import { useAuth } from '../../hooks/useAuth'
import StatsCards from '../../components/admin/StatsCards'
import AdminLayout from '../../components/admin/AdminLayout'
import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../../lib/formatters'

const quickLinks = [
  { label: 'Bağış Kalemleri', to: '/admin/items', icon: Package, color: 'primary', desc: 'Kalem ekle, düzenle, durumunu değiştir' },
  { label: 'Bağışlar', to: '/admin/donations', icon: HandCoins, color: 'amber', desc: 'Bağışları onayla veya reddet' },
  { label: 'Öğrenci İhtiyaçları', to: '/admin/students', icon: GraduationCap, color: 'indigo', desc: 'Öğrenci ihtiyaçlarını yönet' },
  { label: 'S.S.S', to: '/admin/faq', icon: MessageCircle, color: 'blue', desc: 'Sıkça sorulan soruları düzenle' },
  { label: 'Yasal Dayanak', to: '/admin/legal', icon: Scale, color: 'violet', desc: 'Yasal dayanak ve mevzuatları yönet' },
  { label: 'Ödeme Kanalları', to: '/admin/payment-channels', icon: CreditCard, color: 'emerald', desc: 'Banka hesaplarını düzenle' },
  { label: 'Ayarlar', to: '/admin/settings', icon: Settings, color: 'gray', desc: 'Site ayarları, bildirimler, görünüm' },
]

const colorMap: Record<string, { bg: string; text: string; hoverBg: string }> = {
  primary: { bg: 'bg-primary-100', text: 'text-primary-600', hoverBg: 'hover:bg-primary-50' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', hoverBg: 'hover:bg-amber-50' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', hoverBg: 'hover:bg-blue-50' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', hoverBg: 'hover:bg-violet-50' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600', hoverBg: 'hover:bg-gray-50' },
}

export default function Dashboard() {
  const { items } = useDonationItems(true)
  const { user } = useAuth()

  const recentItems = useMemo(() =>
    [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    [items]
  )

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Günaydın'
    if (hour < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">
            {getGreeting()}{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-primary-100 mt-1 text-sm">
            Bağış kampanyalarını buradan yönetebilirsiniz.
            {items.length > 0 && ` Şu anda ${items.filter(i => i.status === 'active').length} aktif kalem var.`}
          </p>
        </div>

        {/* Stats */}
        <StatsCards items={items} />

        {/* Quick Navigation */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const colors = colorMap[link.color]
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${colors.hoverBg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <link.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 text-sm">{link.label}</h3>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {recentItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Son Aktiviteler</h2>
              <Link to="/admin/items" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Tümünü Gör
              </Link>
            </div>
            <div className="space-y-1">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  to="/admin/items"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'active' ? 'bg-primary-500' : item.status === 'draft' ? 'bg-gray-300' : 'bg-blue-500'
                    }`} />
                    <p className="text-sm text-gray-700 truncate font-medium">{item.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{formatRelativeTime(item.updated_at)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
