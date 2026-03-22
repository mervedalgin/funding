import { lazy, Suspense } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const DonationApproval = lazy(() => import('../../components/admin/DonationApproval'))

export default function Donations() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        }>
          <DonationApproval />
        </Suspense>
      </div>
    </AdminLayout>
  )
}
