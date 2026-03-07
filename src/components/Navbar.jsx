import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { ShoppingCart, LogOut, Menu, X, User, Shield, ChevronDown, Info, Phone, Package, MapPin } from 'lucide-react'
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
    window.location.href = '/giris-yap'
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

  // Kategorileri 3 sütuna böl
  const cols = [[], [], []]
  categories.forEach((cat, i) => cols[i % 3].push(cat))

  return (
    <>
      {/* Top bar */}
<div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 text-blue-100 text-[11px] py-2 overflow-hidden hidden md:block border-b border-blue-600/30">
  <div className="flex animate-marquee whitespace-nowrap">
    {[...Array(3)].map((_, i) => (
      <span key={i} className="flex items-center gap-10 mx-12">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <MapPin size={11} className="text-blue-300" />
          <span className="text-white font-semibold">Erzurum</span>
        </span>
        <span className="text-blue-500">·</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          Permolit Boya <span className="text-white font-bold mx-1">Doğu Anadolu</span> Bölge Bayii
        </span>
        <span className="text-blue-500">·</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          Profesyonel Satış & Teknik Destek
        </span>
        <span className="text-blue-500">·</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <Shield size={11} className="text-blue-300" />
          Orijinal & Güvenilir Ürünler
        </span>
        <span className="text-blue-500">·</span>
        <a href="https://www.permolitboya.com.tr/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-white hover:text-blue-200 transition font-bold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
          permolitboya.com.tr ↗
        </a>
        <span className="text-blue-500">·</span>
      </span>
    ))}
  </div>
</div>

 <nav className={`sticky top-0 z-50 transition-all duration-300 ${
  scrolled
    ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-900/10 border-b border-slate-100'
    : 'bg-white/85 backdrop-blur-md border-b border-slate-100/80'
}`}>
  {/* Hafif gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white/50 to-sky-50/40 pointer-events-none" />

  <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
    <div className="h-24 flex items-center justify-between gap-4">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3.5 flex-shrink-0">
        <div className="relative">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100">
            <img src="/logo.png" alt="ESF"
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
            <span className="hidden text-blue-700 font-black text-xl">E</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="hidden sm:block">
          <span className="text-blue-950 font-black text-[17px] leading-tight block tracking-tight">ESF Yapı & İnşaat</span>
          <span className="text-blue-500 text-[11px] uppercase tracking-[0.16em] font-semibold">Boya & Sarf Malzemeleri</span>
        </div>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-0.5 flex-1 ml-2">
        <Link to="/"
          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
            isActive('/') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
          }`}>
          Ana Sayfa
        </Link>

        <div ref={megaRef} className="relative">
          <button
            onClick={() => setMegaOpen(!megaOpen)}
            onMouseEnter={() => setMegaOpen(true)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
              megaOpen ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
            }`}>
            <Package size={14} />
            Ürünler
            <ChevronDown size={13} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
          </button>

          {megaOpen && (
            <div onMouseLeave={() => setMegaOpen(false)}
              className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100 z-50 overflow-hidden"
              style={{ width: '580px', boxShadow: '0 20px 60px -10px rgba(30,64,175,0.15), 0 8px 24px -6px rgba(0,0,0,0.08)' }}>

              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
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
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition ${
                          activeCategory === cat ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-blue-400'
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
                isActive(path) ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}>
              {label}
            </Link>
          )
        })}
      </div>

      {/* Sağ */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {activeCategory && (
          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
            {activeCategory}
            <button onClick={() => handleCategorySelect(null)} className="opacity-50 hover:opacity-100 leading-none text-base">×</button>
          </span>
        )}
        {user ? (
          <>
            <Link to="/siparisler"
              className="text-sm text-slate-500 hover:text-blue-700 px-3 py-2 rounded-xl hover:bg-slate-50 transition font-medium">
              Siparişlerim
            </Link>
            <Link to={profile?.role === 'admin' ? '/admin/dashboard' : '/profile'}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700 px-3 py-2 rounded-xl hover:bg-slate-50 transition font-medium">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-100">
                {(profile?.full_name || 'K')[0].toUpperCase()}
              </div>
              <span>{profile?.role === 'admin' ? 'Admin Panel' : profile?.full_name?.split(' ')[0] || 'Profil'}</span>
            </Link>
            {profile?.role !== 'admin' && (
              <Link to="/cart"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200">
                <ShoppingCart size={15} />
                Sepet
                {count > 0 && (
                  <span className="bg-white text-blue-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )}
            <button onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link to="/giris-yap"
              className="text-sm text-slate-600 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition font-semibold border border-slate-200">
              Giriş Yap
            </Link>
            <Link to="/kayit-ol"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition shadow-md shadow-blue-200">
              Kayıt Ol
            </Link>
          </>
        )}
      </div>

      {/* Mobil sağ */}
      <div className="flex md:hidden items-center gap-2">
        {user && profile?.role !== 'admin' && (
          <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200">
            <ShoppingCart size={17} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {count}
              </span>
            )}
          </Link>
        )}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 flex items-center justify-center text-slate-600 rounded-xl hover:bg-slate-100 transition">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </div>
  </div>

  {/* Mobil menü */}
  {mobileOpen && (
    <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 max-h-[85vh] overflow-y-auto relative z-10">
      {user ? (
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-50/80 to-sky-50/50 border-b border-slate-100">
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ring-2 ring-blue-100">
            {(profile?.full_name || 'K')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{profile?.full_name || 'Kullanıcı'}</p>
            <p className="text-xs text-slate-400">{profile?.role === 'admin' ? '⚡ Yönetici' : 'Hesabım'}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <Link to="/giris-yap" className="flex-1 text-center text-sm py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold">Giriş Yap</Link>
          <Link to="/kayit-ol" className="flex-1 text-center text-sm py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-200">Kayıt Ol</Link>
        </div>
      )}

      <div className="px-3 py-2 border-b border-slate-100">
        {[
          { to: '/', label: 'Ana Sayfa' },
          ...(user ? [
            { to: '/orders', label: 'Siparişlerim' },
            { to: profile?.role === 'admin' ? '/admin/dashboard' : '/profile', label: profile?.role === 'admin' ? 'Admin Panel' : 'Profilim' },
          ] : []),
          { to: '/about', label: 'Hakkımızda' },
          { to: '/contact', label: 'İletişim' },
        ].map(({ to, label }) => (
          <Link key={to} to={to}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition mb-0.5 ${
              location.pathname === to ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kategoriler</p>
          <button onClick={() => handleCategorySelect(null)}
            className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
            Tümünü Gör
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {categories.map(cat => (
            <button key={cat} onClick={() => handleCategorySelect(cat)}
              className={`text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition leading-snug ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-100'
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