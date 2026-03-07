import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, LogOut, Menu, X, Shield, ChevronDown, Package, MapPin } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import { supabase } from '../lib/supabase'

export default function Navbar({ onCategorySelect, activeCategory }) {
  const { profile, user } = useAuthStore()
  const getCount = useCartStore(s => s.getCount)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const isActive = (path) => location.pathname === path
  const megaRef = useRef()
  const count = getCount()

  useEffect(() => {
    supabase.from('categories').select('name').order('name')
      .then(({ data }) => setCategories(data?.map(c => c.name) || []))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false); setMegaOpen(false) }, [location.pathname])

  const handleLogout = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) localStorage.removeItem(key)
    })
    window.location.href = '/'
  }

  const handleCategorySelect = (cat) => {
    onCategorySelect?.(cat)
    setMegaOpen(false)
    setMobileOpen(false)
    if (location.pathname === '/') {
      setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } else {
      navigate('/')
      setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 400)
    }
  }

  const cols = [[], [], []]
  categories.forEach((cat, i) => cols[i % 3].push(cat))

  return (
    <>
      {/* Top bar — kayan yazı */}
      <div className="bg-blue-950 text-blue-300 text-[11px] py-1.5 overflow-hidden hidden md:block border-b border-blue-800/60">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="flex items-center gap-10 mx-12">
              <span className="flex items-center gap-2">
                <MapPin size={10} className="text-blue-400" />
                <span className="text-white font-semibold">Erzurum</span>
              </span>
              <span className="text-blue-700">·</span>
              <span>Permolit Boya <span className="text-sky-400 font-bold">Doğu Anadolu</span> Bölge Bayii</span>
              <span className="text-blue-700">·</span>
              <span>Profesyonel Satış & Teknik Destek</span>
              <span className="text-blue-700">·</span>
              <span className="flex items-center gap-1.5">
                <Shield size={10} className="text-blue-400" />
                Orijinal & Güvenilir Ürünler
              </span>
              <span className="text-blue-700">·</span>
              <a href="https://www.permolitboya.com.tr/" target="_blank" rel="noopener noreferrer"
                className="text-sky-400 hover:text-white transition font-bold tracking-wide">
                permolitboya.com.tr ↗
              </a>
              <span className="text-blue-700">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* NAV — koyu mavi zemin */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-blue-950/95 backdrop-blur-xl shadow-2xl shadow-blue-950/50'
          : 'bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950'
      }`}>
        {/* ince alt çizgi efekti */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        {/* hafif glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="h-20 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative">
                <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/15 transition backdrop-blur-sm">
                  <img src="/logo.png" alt="ESF"
                    className="w-7 h-7 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                  <span className="hidden text-white font-black text-xl">E</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-blue-950" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-black text-[16px] leading-tight block tracking-tight">ESF Yapı & İnşaat</span>
                <span className="text-blue-400 text-[10px] uppercase tracking-[0.18em] font-medium">Boya & Sarf Malzemeleri</span>
              </div>
            </Link>

            {/* Mobil orta — başlık */}
            <div className="flex md:hidden flex-1 justify-center flex-col items-center">
              <span className="text-white font-black text-[19px] tracking-tight leading-tight">ESF Yapı & İnşaat</span>
              <span className="text-blue-400 text-[9px] uppercase tracking-[0.2em] font-medium">Boya & Sarf</span>
            </div>

            {/* Desktop Nav linkleri */}
            <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
              <Link to="/"
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                  isActive('/')
                    ? 'text-white bg-white/15 border border-white/20'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}>
                Ana Sayfa
              </Link>

              <div ref={megaRef} className="relative">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  onMouseEnter={() => setMegaOpen(true)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                    megaOpen
                      ? 'text-white bg-white/15 border border-white/20'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}>
                  <Package size={14} />
                  Ürünler
                  <ChevronDown size={13} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
                </button>

                {megaOpen && (
                  <div onMouseLeave={() => setMegaOpen(false)}
                    className="absolute top-full left-0 mt-3 bg-blue-950/95 backdrop-blur-xl rounded-2xl border border-white/10 z-50 overflow-hidden"
                    style={{ width: '580px', boxShadow: '0 24px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}>

                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between border-b border-white/10">
                      <div>
                        <p className="text-white font-bold text-sm">Ürün Kategorileri</p>
                        <p className="text-blue-200 text-xs mt-0.5">Tüm Permolit ürünlerini keşfet</p>
                      </div>
                      <button onClick={() => handleCategorySelect(null)}
                        className="text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg font-semibold transition border border-white/20">
                        Tümünü Gör →
                      </button>
                    </div>

                    <div className="p-4 grid grid-cols-3 gap-0.5">
                      {cols.map((col, ci) => (
                        <div key={ci} className="flex flex-col">
                          {col.map(cat => (
                            <button key={cat} onClick={() => handleCategorySelect(cat)}
                              className={`text-left px-3 py-2.5 rounded-xl text-sm transition group flex items-center gap-2 ${
                                activeCategory === cat
                                  ? 'bg-white/15 text-white font-semibold'
                                  : 'text-blue-300 hover:bg-white/10 hover:text-white'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition ${
                                activeCategory === cat ? 'bg-sky-400' : 'bg-blue-600 group-hover:bg-sky-400'
                              }`} />
                              {cat}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {['Hakkımızda|/hakkimizda', 'İletişim|/iletisim'].map(item => {
                const [label, path] = item.split('|')
                return (
                  <Link key={path} to={path}
                    className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                      isActive(path)
                        ? 'text-white bg-white/15 border border-white/20'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                    }`}>
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Desktop sağ */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {activeCategory && (
                <span className="text-xs bg-white/10 text-sky-300 font-semibold px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5">
                  {activeCategory}
                  <button onClick={() => handleCategorySelect(null)} className="opacity-50 hover:opacity-100 leading-none text-base">×</button>
                </span>
              )}
              {user ? (
                <>
                  <Link to="/siparislerim"
                    className="text-sm text-blue-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition font-medium">
                    Siparişlerim
                  </Link>
                  <Link to={profile?.role === 'admin' ? '/admin/dashboard' : '/profilim'}
                    className="flex items-center gap-2 text-sm text-blue-200 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition font-medium">
                    <div className="w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-sky-500/30">
                      {(profile?.full_name || 'K')[0].toUpperCase()}
                    </div>
                    <span>{profile?.role === 'admin' ? 'Admin Panel' : profile?.full_name?.split(' ')[0] || 'Profil'}</span>
                  </Link>
                  {profile?.role !== 'admin' && (
                    <Link to="/sepetim"
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-sky-900/40">
                      <ShoppingCart size={15} />
                      Sepet
                      {count > 0 && (
                        <span className="bg-white text-sky-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="p-2 text-blue-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/giris-yap"
                    className="text-sm text-blue-200 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition font-semibold border border-white/15">
                    Giriş Yap
                  </Link>
                  <Link to="/kayit-ol"
                    className="text-sm bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl font-semibold transition shadow-lg shadow-sky-900/40">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>

            {/* Mobil sağ */}
            <div className="flex md:hidden items-center gap-2">
              {user && profile?.role !== 'admin' && (
                <Link to="/sepetim" className="relative flex items-center justify-center w-10 h-10 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-900/40">
                  <ShoppingCart size={17} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-blue-950">
                      {count}
                    </span>
                  )}
                </Link>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="w-10 h-10 flex items-center justify-center text-blue-200 rounded-xl hover:bg-white/10 transition">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil menü */}
        {mobileOpen && (
          <div className="md:hidden bg-blue-950/98 backdrop-blur-xl border-t border-white/10 max-h-[85vh] overflow-y-auto relative z-10">
            {user ? (
              <div className="flex items-center gap-3 px-5 py-4 bg-white/5 border-b border-white/10">
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ring-2 ring-sky-500/30">
                  {(profile?.full_name || 'K')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{profile?.full_name || 'Kullanıcı'}</p>
                  <p className="text-xs text-blue-400">{profile?.role === 'admin' ? '⚡ Yönetici' : 'Hesabım'}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-blue-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <Link to="/giris-yap" className="flex-1 text-center text-sm py-2.5 rounded-xl border border-white/20 text-blue-200 font-semibold">Giriş Yap</Link>
                <Link to="/kayit-ol" className="flex-1 text-center text-sm py-2.5 rounded-xl bg-sky-500 text-white font-semibold shadow-lg shadow-sky-900/40">Kayıt Ol</Link>
              </div>
            )}

            <div className="px-3 py-2 border-b border-white/10">
              {[
                { to: '/', label: 'Ana Sayfa' },
                ...(user ? [
                  { to: '/siparislerim', label: 'Siparişlerim' },
                  { to: profile?.role === 'admin' ? '/admin/dashboard' : '/profilim', label: profile?.role === 'admin' ? 'Admin Panel' : 'Profilim' },
                ] : []),
                { to: '/hakkimizda', label: 'Hakkımızda' },
                { to: '/iletisim', label: 'İletişim' },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition mb-0.5 ${
                    location.pathname === to
                      ? 'bg-white/15 text-white border border-white/15'
                      : 'text-blue-300 hover:bg-white/10 hover:text-white'
                  }`}>
                  {label}
                </Link>
              ))}
            </div>

            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Kategoriler</p>
                <button onClick={() => handleCategorySelect(null)}
                  className="text-xs text-sky-400 font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  Tümünü Gör
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map(cat => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition leading-snug ${
                      activeCategory === cat
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/40'
                        : 'bg-white/5 text-blue-300 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}