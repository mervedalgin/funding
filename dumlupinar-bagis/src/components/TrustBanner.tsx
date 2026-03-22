import { ShieldCheck, Phone } from 'lucide-react'

export default function TrustBanner() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2 text-primary-600">
        <ShieldCheck className="w-6 h-6 shrink-0" />
        <span className="text-sm font-semibold">Resmi Okul Bağış Sayfası</span>
      </div>
      <div className="hidden sm:block w-px h-6 bg-gray-200" />
      <p className="text-sm text-gray-600 text-center sm:text-left">
        Dumlupınar İlkokulu — Birecik, Şanlıurfa
      </p>
      <div className="hidden sm:block w-px h-6 bg-gray-200" />
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Phone className="w-3.5 h-3.5" />
        Hesap sahibi: Okul Aile Birliği
      </p>
    </div>
  )
}
