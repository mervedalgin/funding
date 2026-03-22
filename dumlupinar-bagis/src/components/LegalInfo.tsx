import { ShieldCheck, MapPin, Phone, Building2, FileText } from 'lucide-react'

export default function LegalInfo() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Yasal Bilgiler ve Güvenilirlik</h3>
          <p className="text-sm text-gray-500">Bağışlarınız resmi okul hesabına ulaşır</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Okul Bilgileri
          </h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Kurum Adı</dt>
              <dd className="text-gray-800 font-medium">Dumlupınar İlkokulu ve Ortaokulu</dd>
            </div>
            <div>
              <dt className="text-gray-500">MEB Kurum Kodu</dt>
              <dd className="text-gray-800 font-medium font-mono">
                63-32-038
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <dd className="text-gray-800">Dumlupınar Mahallesi, Birecik, Şanlıurfa</dd>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <dd className="text-gray-800">
                (0414) 652 00 00
              </dd>
            </div>
          </dl>
        </div>

        {/* PTA Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Okul Aile Birliği
          </h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Birlik Adı</dt>
              <dd className="text-gray-800 font-medium">Dumlupınar İlkokulu Okul Aile Birliği</dd>
            </div>
            <div>
              <dt className="text-gray-500">Vergi Numarası</dt>
              <dd className="text-gray-800 font-medium font-mono">
                1234567890
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">IBAN Hesap Sahibi</dt>
              <dd className="text-gray-800 font-medium">Dumlupınar İlkokulu Okul Aile Birliği</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          Tüm bağışlar, T.C. Milli Eğitim Bakanlığı'na bağlı Dumlupınar İlkokulu Okul Aile Birliği'nin
          resmi banka hesabına yapılmaktadır. Bağışlarınız Gelir Vergisi Kanunu Madde 89/1-4 kapsamında
          vergi indirimine konu olabilir. Detaylı bilgi için okulumuzla iletişime geçebilirsiniz.
        </p>
      </div>
    </section>
  )
}
