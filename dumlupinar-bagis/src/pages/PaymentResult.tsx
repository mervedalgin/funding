import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, XCircle, Home } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{isSuccess ? 'Ödeme Başarılı' : 'Ödeme Başarısız'} - Dumlupınar İlkokulu</title>
      </Helmet>

      <Navbar />

      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-md w-full text-center space-y-6">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödemeniz Alındı!</h1>
                <p className="text-gray-600">
                  Bağışınız için teşekkür ederiz. Ödemeniz başarıyla işlendi ve okulumuzun ihtiyaçları için kullanılacaktır.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödeme Başarısız</h1>
                <p className="text-gray-600">
                  Üzgünüz, ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya banka havalesi ile bağış yapın.
                </p>
              </div>
            </>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors min-h-[44px]"
          >
            <Home className="w-5 h-5" />
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
