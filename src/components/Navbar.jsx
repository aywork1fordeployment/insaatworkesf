import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, LogOut, Menu, X, ChevronDown, Package, MapPin, Shield, ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import { supabase } from '../lib/supabase'

export default function Navbar({ onCategorySelect, activeCategory }) {
  const { profile, user } = useAuthStore()
  const getCount = useCartStore(s => s.getCount)
  const navigate = useNavigate()
  const location = useLocation()
  const [marqueeItems, setMarqueeItems] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [expandedMobile, setExpandedMobile] = useState(null)
  const megaRef = useRef()
  const count = getCount()

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    supabase.from('categories').select('*').order('name')
      .then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    supabase
      .from('marquee_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setMarqueeItems(data || []))
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
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

  const parents = categories.filter(c => !c.parent_id)
  const childrenOf = (parentId) => categories.filter(c => c.parent_id === parentId)

  return (
    <>
{/* Top bar — kayan yazı */}
{marqueeItems.length > 0 && (
  <div className="bg-blue-950 text-blue-300 text-[11px] py-2 overflow-hidden hidden md:block border-b border-blue-800/60 relative w-full">
    <div className="flex flex-nowrap min-w-full">
      {/* Aşağıdaki animate-marquee sınıfı iki kez basılacak.
          İçerideki [...Array(10)] ise senin o 'ABCA' yazılarını yan yana dizer.
      */}
      <div className="flex animate-marquee whitespace-nowrap">
        
        {/* BİRİNCİ GRUP (Ekranı dolduran vagonlar) */}
        <div className="flex items-center">
          {[...Array(10)].map((_, i) => (
            <div key={`vagon1-${i}`} className="flex items-center">
              {marqueeItems.map((item) => (
                <div key={`item1-${item.id}-${i}`} className="flex items-center mx-10">
                  <span className="font-bold uppercase tracking-widest whitespace-nowrap" 
                        dangerouslySetInnerHTML={{ __html: item.text }} />
                  <span className="text-blue-700/50 font-black ml-10">/</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* İKİNCİ GRUP (Sonsuz döngü için birinci grubun kopyası) */}
        <div className="flex items-center">
          {[...Array(10)].map((_, i) => (
            <div key={`vagon2-${i}`} className="flex items-center">
              {marqueeItems.map((item) => (
                <div key={`item2-${item.id}-${i}`} className="flex items-center mx-10">
                  <span className="font-bold uppercase tracking-widest whitespace-nowrap" 
                        dangerouslySetInnerHTML={{ __html: item.text }} />
                  <span className="text-blue-700/50 font-black ml-10">/</span>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
)}
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
                  <img src="/logo-small.webp" alt="ESF"
                    className="w-7 h-7 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                  <span className="hidden text-white font-black text-xl">E</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-blue-950" />
              </div>
              <div className="hidden md:block">
                <span className="text-white font-black text-[16px] leading-tight block tracking-tight">ESF Yapı & İnşaat</span>
                <span className="text-blue-400 text-[10px] uppercase tracking-[0.18em] font-medium">Boya & Sarf Malzemeleri</span>
              </div>
            </Link>

            {/* Mobil orta başlık */}
            <div className="flex md:hidden flex-1 justify-center flex-col items-center">
              <span className="text-white font-black text-[19px] tracking-tight leading-tight">ESF Yapı & İnşaat</span>
              <span className="text-blue-400 text-[9px] uppercase tracking-[0.2em] font-medium">Boya & Sarf</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
              <Link to="/"
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                  isActive('/')
                    ? 'text-white bg-white/15 border border-white/20'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}>
                Ana Sayfa
              </Link>

              {/* Mega Menu */}
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
                  <div
                    onMouseLeave={() => setMegaOpen(false)}
                    className="absolute top-full left-0 mt-3 bg-blue-950/95 backdrop-blur-xl rounded-2xl border border-white/10 z-50 overflow-hidden"
                    style={{ width: '640px', boxShadow: '0 24px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}>

                    {/* Mega menu header */}
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

                    {/* Kategoriler — parent + children */}
                    <div className="p-4 max-h-96 overflow-y-auto">
                      {parents.length === 0 ? (
                        <p className="text-sm text-blue-400 text-center py-4">Kategori bulunamadı</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {parents.map(parent => {
                            const children = childrenOf(parent.id)
                            return (
                              <div key={parent.id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                {/* Parent */}
                                <button
                                  onClick={() => handleCategorySelect(parent.name)}
                                  className={`w-full text-left flex items-center gap-2 font-bold text-sm mb-2 pb-2 border-b border-white/10 transition hover:text-white ${
                                    activeCategory === parent.name ? 'text-white' : 'text-blue-200'
                                  }`}>
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    activeCategory === parent.name ? 'bg-sky-400' : 'bg-blue-500'
                                  }`} />
                                  {parent.name}
                                </button>

                                {/* Children */}
                                {children.length > 0 ? (
                                  <div className="flex flex-col gap-0.5">
                                    {children.map(child => (
                                      <button key={child.id}
                                        onClick={() => handleCategorySelect(child.name)}
                                        className={`text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition ${
                                          activeCategory === child.name
                                            ? 'bg-white/15 text-white font-semibold'
                                            : 'text-blue-400 hover:bg-white/10 hover:text-blue-200'
                                        }`}>
                                        <ChevronRight size={10} className="text-blue-600 flex-shrink-0" />
                                        {child.name}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-blue-600 px-2">Alt kategori yok</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
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
  aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
  className="w-10 h-10 flex items-center justify-center text-blue-200 rounded-xl hover:bg-white/10 transition">
  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
</button>
            </div>
          </div>
        </div>

        {/* Mobil menü */}
        {mobileOpen && (
          <div className="md:hidden bg-blue-950/98 backdrop-blur-xl border-t border-white/10 max-h-[85vh] overflow-y-auto relative z-10">

            {/* Kullanıcı bilgisi */}
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

            {/* Nav linkleri */}
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

            {/* Mobil kategoriler — parent + sub */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Kategoriler</p>
                <button onClick={() => handleCategorySelect(null)}
                  className="text-xs text-sky-400 font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  Tümünü Gör
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {parents.map(parent => {
                  const children = childrenOf(parent.id)
                  const isExpanded = expandedMobile === parent.id

                  return (
                    <div key={parent.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                      {/* Parent butonu */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCategorySelect(parent.name)}
                          className={`flex-1 text-left px-4 py-3 text-sm font-bold transition ${
                            activeCategory === parent.name ? 'text-white' : 'text-blue-200'
                          }`}>
                          {parent.name}
                        </button>
                        {children.length > 0 && (
                          <button
                            onClick={() => setExpandedMobile(isExpanded ? null : parent.id)}
                            className="px-3 py-3 text-blue-400 hover:text-sky-400 transition">
                            <ChevronDown size={15} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Alt kategoriler */}
                      {isExpanded && children.length > 0 && (
                        <div className="border-t border-white/10 bg-blue-900/30">
                          {children.map(child => (
                            <button key={child.id}
                              onClick={() => handleCategorySelect(child.name)}
                              className={`w-full text-left flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition ${
                                activeCategory === child.name
                                  ? 'text-white bg-white/10'
                                  : 'text-blue-400 hover:bg-white/5 hover:text-blue-200'
                              }`}>
                              <ChevronRight size={11} className="text-blue-600 flex-shrink-0" />
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}