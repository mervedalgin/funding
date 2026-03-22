import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Home,
  LogOut,
  Menu,
  X,
  Package,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Anasayfa', to: '/', icon: Home, external: true },
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bağış Kalemleri', to: '/admin/dashboard?tab=items', icon: Package },
  { label: 'Ödeme Kanalları', to: '/admin/payment-channels', icon: CreditCard },
  { label: 'Bağışlar', to: '/admin/dashboard?tab=donations', icon: Users },
  { label: 'Öğrenci İhtiyaçları', to: '/admin/dashboard?tab=students', icon: GraduationCap },
  { label: 'S.S.S', to: '/admin/dashboard?tab=faq', icon: MessageCircle },
  { label: 'Ayarlar', to: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const isActive = (item: typeof navItems[number]) => {
    const itemUrl = new URL(item.to, window.location.origin)
    if (itemUrl.searchParams.has('tab')) {
      return location.pathname === itemUrl.pathname && location.search === itemUrl.search
    }
    return location.pathname === item.to && !location.search
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo / Brand */}
        <div className={`border-b border-gray-100 flex items-center ${collapsed ? 'justify-center px-2 py-5' : 'justify-between px-5 py-5'}`}>
          <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">Dumlupınar</p>
              <p className="text-[11px] text-gray-400 leading-tight whitespace-nowrap">Yönetim Paneli</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center mx-3 mt-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          title={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>

        {/* Nav items */}
        <nav className={`flex-1 py-3 space-y-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] relative ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-500 rounded-r-full" />
                )}
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                  {item.label}
                </span>
                {item.external && !collapsed && (
                  <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">Site</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info + Logout */}
        <div className={`border-t border-gray-100 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
          {/* User info */}
          {user && !collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-medium text-gray-700 truncate">{user.email}</p>
              <p className="text-[11px] text-gray-400">Yönetici</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Çıkış Yap' : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full min-h-[44px] ${
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              Çıkış Yap
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Menüyü aç"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <p className="text-sm font-bold text-gray-800">Dumlupınar Yönetim</p>
          <div className="w-[44px]" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
