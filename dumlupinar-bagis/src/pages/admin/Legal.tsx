import { lazy, Suspense } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const LegalBasisManager = lazy(() => import('../../components/admin/LegalBasisManager'))

export default function Legal() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        }>
          <LegalBasisManager />
        </Suspense>
      </div>
    </AdminLayout>
  )
}
