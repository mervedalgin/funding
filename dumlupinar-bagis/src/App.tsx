import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ItemDetail from './pages/ItemDetail'
import NotFound from './pages/NotFound'
import LegalBasis from './pages/LegalBasis'
import Contact from './pages/Contact'
import AdminGuard from './components/admin/AdminGuard'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'

const Donors = lazy(() => import('./pages/Donors'))
const PaymentResult = lazy(() => import('./pages/PaymentResult'))
const StudentNeedDetail = lazy(() => import('./pages/StudentNeedDetail'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminItems = lazy(() => import('./pages/admin/Items'))
const AdminDonations = lazy(() => import('./pages/admin/Donations'))
const AdminStudents = lazy(() => import('./pages/admin/Students'))
const AdminFAQ = lazy(() => import('./pages/admin/AdminFAQ'))
const AdminLegal = lazy(() => import('./pages/admin/Legal'))
const PaymentChannels = lazy(() => import('./pages/admin/PaymentChannels'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

const AdminFallback = (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/yasal-dayanak" element={<LegalBasis />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/bagiscilarimiz" element={<Suspense fallback={AdminFallback}><Donors /></Suspense>} />
          <Route path="/odeme-sonucu" element={<Suspense fallback={AdminFallback}><PaymentResult /></Suspense>} />
          <Route path="/student-need/:id" element={<Suspense fallback={AdminFallback}><StudentNeedDetail /></Suspense>} />
          <Route path="/sss" element={<Suspense fallback={AdminFallback}><FAQ /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={AdminFallback}><Login /></Suspense>} />
          <Route path="/admin/dashboard" element={<Suspense fallback={AdminFallback}><AdminGuard><Dashboard /></AdminGuard></Suspense>} />
          <Route path="/admin/items" element={<Suspense fallback={AdminFallback}><AdminGuard><AdminItems /></AdminGuard></Suspense>} />
          <Route path="/admin/donations" element={<Suspense fallback={AdminFallback}><AdminGuard><AdminDonations /></AdminGuard></Suspense>} />
          <Route path="/admin/students" element={<Suspense fallback={AdminFallback}><AdminGuard><AdminStudents /></AdminGuard></Suspense>} />
          <Route path="/admin/faq" element={<Suspense fallback={AdminFallback}><AdminGuard><AdminFAQ /></AdminGuard></Suspense>} />
          <Route path="/admin/legal" element={<Suspense fallback={AdminFallback}><AdminGuard><AdminLegal /></AdminGuard></Suspense>} />
          <Route path="/admin/payment-channels" element={<Suspense fallback={AdminFallback}><AdminGuard><PaymentChannels /></AdminGuard></Suspense>} />
          <Route path="/admin/settings" element={<Suspense fallback={AdminFallback}><AdminGuard><AdminSettings /></AdminGuard></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
