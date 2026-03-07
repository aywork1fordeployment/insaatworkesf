import { Link } from 'react-router-dom'
import { Phone, MapPin, Mail, ExternalLink, ChevronRight, Shield, Truck, Package } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0B1528] text-slate-400">

      {/* Üst bant */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, text: 'Orijinal Permolit Ürünleri' },
            { icon: Truck, text: 'Erzurum\'a Hızlı Teslimat' },
            { icon: Package, text: 'Profesyonel Teknik Destek' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-blue-400" />
              </div>
              <span className="text-sm text-slate-400 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ana içerik */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Marka */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <img src="/logo.png" alt="ESF Logo" className="w-7 h-7 object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
              <span className="hidden text-blue-700 font-black text-base">E</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">ESF Yapı & İnşaat</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium">Boya & Sarf Malzemeleri</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 mb-5">
            Permolit Boya Doğu Anadolu Bölge Bayii olarak Erzurum ve çevresine profesyonel boya ve yapı malzemeleri sunuyoruz.
          </p>
          <a href="https://www.permolitboya.com.tr/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition font-semibold bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">
            <ExternalLink size={11} /> permolitboya.com.tr
          </a>
        </div>

        {/* Hızlı linkler */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
            Hızlı Erişim
          </h4>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Ana Sayfa', to: '/' },
              { label: 'Tüm Ürünler', to: '/#products' },
              { label: 'Siparişlerim', to: '/orders' },
              { label: 'Profilim', to: '/profile' },
              { label: 'Hakkımızda', to: '/about' },
              { label: 'İletişim', to: '/contact' },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition py-1 group">
                <ChevronRight size={12} className="text-blue-500/50 group-hover:text-blue-400 transition" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* İletişim */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
            İletişim
          </h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5 font-medium uppercase tracking-wide">Adres</p>
                <p className="text-sm text-slate-400">Erzurum, Türkiye</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5 font-medium uppercase tracking-wide">Telefon</p>
                <a href="tel:+90" className="text-sm text-slate-400 hover:text-white transition">+90 (XXX) XXX XX XX</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5 font-medium uppercase tracking-wide">E-posta</p>
                <a href="mailto:info@esfyapi.com" className="text-sm text-slate-400 hover:text-white transition">info@esfyapi.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt çizgi */}
      <div className="border-t border-white/5 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} ESF Yapı İnşaat. Tüm hakları saklıdır.</p>
          <p className="text-xs text-slate-700 font-medium">Permolit Boya Yetkili Bayii · Erzurum</p>
        </div>
      </div>
    </footer>
  )
}