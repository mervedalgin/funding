import { useState } from 'react'
import { Facebook, Twitter, MessageSquare, Copy, Check, Share2 } from 'lucide-react'

interface SocialShareProps {
  url: string
  title: string
  description?: string
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDesc = encodeURIComponent(description || title)

  const copyLink = async (platform: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(platform)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(platform)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const platforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2]',
      bgColor: 'bg-[#1877F2]',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400'),
    },
    {
      name: 'X',
      icon: Twitter,
      color: 'hover:bg-black/10 hover:text-black',
      bgColor: 'bg-black',
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank', 'width=600,height=400'),
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'hover:bg-[#25D366]/10 hover:text-[#25D366]',
      bgColor: 'bg-[#25D366]',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedDesc}%20${encodedUrl}`, '_blank'),
    },
    {
      name: 'Instagram',
      icon: Copy,
      color: 'hover:bg-[#E4405F]/10 hover:text-[#E4405F]',
      bgColor: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      action: () => copyLink('Instagram'),
      isCopy: true,
    },
    {
      name: 'TikTok',
      icon: Copy,
      color: 'hover:bg-black/10 hover:text-black',
      bgColor: 'bg-black',
      action: () => copyLink('TikTok'),
      isCopy: true,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">Bu Hikayeyi Paylaş</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={p.action}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 transition-all duration-200 min-h-[44px] ${p.color}`}
          >
            {copied === p.name ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <p.icon className="w-4 h-4" />
            )}
            <span>{copied === p.name ? 'Kopyalandı!' : p.name}</span>
            {p.isCopy && copied !== p.name && (
              <span className="text-[10px] text-gray-400 ml-0.5">(link kopyala)</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
