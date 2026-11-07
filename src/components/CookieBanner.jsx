import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner({ onOpenPolicy }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('esf_cookie_consent')
    if (!consent) {
      // 1 saniye sonra hafifçe belirsin
      const timer = setTimeout(() => setShow(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('esf_cookie_consent', 'accepted')
    setShow(false)
  }

  if (!show) return null

  return (
    <aside
      aria-label="Çerez bilgilendirmesi"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-slate-900/95 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/10 z-50 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
          <Cookie size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs sm:text-sm text-white mb-1">
            Çerez ve Gizlilik Bildirimi
          </p>
          <p className="text-slate-300 text-xs leading-relaxed mb-3">
            Sitemizde sepetinizi hatırlamak ve temel hizmetleri sunabilmek için zorunlu teknik çerezler kullanılmaktadır. 
            Detaylı bilgi için{' '}
            <button
              type="button"
              onClick={onOpenPolicy}
              className="text-blue-400 hover:text-blue-300 underline font-semibold transition"
            >
              Gizlilik & KVKK Politikamızı
            </button>{' '}
            inceleyebilirsiniz.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-900/50"
            >
              Anladım ve Kabul Ediyorum
            </button>
            <button
              onClick={handleAccept}
              className="text-slate-400 hover:text-white text-xs font-medium px-2.5 py-2 rounded-xl transition"
            >
              Kapat
            </button>
          </div>
        </div>
        <button
          onClick={handleAccept}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition flex-shrink-0"
          aria-label="Kapat"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  )
}
