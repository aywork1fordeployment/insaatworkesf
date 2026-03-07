import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { optimizeUrl } from '../lib/cloudinary'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import { ShoppingCart, Search, Package, Shield, Truck, ChevronRight, ChevronLeft, Zap, ArrowRight } from 'lucide-react'

const SLIDES = [
  {
    title: 'Permolit Boya',
    highlight: 'Doğu Anadolu Bayii',
    desc: 'İç cephe, dış cephe, tavan ve özel boya sistemlerinde Erzurum\'un güvenilir adresi.',
    badge: 'Orijinal & Güvenilir',
  },
  {
    title: 'Permomax & Premium',
    highlight: 'Seri Ürünler',
    desc: 'Yüksek örtücülük, uzun ömür ve profesyonel sonuçlar için tasarlanmış ürün serisi.',
    badge: 'Üstün Kalite',
  },
  {
    title: 'Teknik Destek &',
    highlight: 'Danışmanlık',
    desc: 'Proje bazlı ürün seçimi, uygulama rehberliği ve satış sonrası destek hizmeti.',
    badge: 'Uzman Ekip',
  },
]

function HeroSlider({ user, onScroll }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef()

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length)
    }, 6000)
  }

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [])

  const next = () => { setCurrent(c => (c + 1) % SLIDES.length); startTimer() }
  const prev = () => { setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length); startTimer() }
  const go = (idx) => { setCurrent(idx); startTimer() }

  const slide = SLIDES[current]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900" style={{ minHeight: '520px' }}>

      {/* Arka plan — pointer-events-none zorunlu */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-sky-400/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Sol dekoratif çizgi — pointer-events-none */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent hidden lg:block pointer-events-none" />

      {/* İçerik */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Zap size={10} className="text-blue-300" />
            {slide.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-5">
            <span className="text-white">{slide.title}</span>
            <br />
            <span className="text-blue-400">{slide.highlight}</span>
          </h1>

          <p className="text-blue-200/70 text-sm sm:text-base mb-8 leading-relaxed max-w-lg">
            {slide.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <button onClick={onScroll}
              className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-xl shadow-black/20 group">
              <ShoppingCart size={16} />
              Ürünleri Keşfet
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {!user && (
              <Link to="/kayit-ol"
                className="flex items-center justify-center gap-2 border border-blue-400/30 hover:border-blue-400/60 bg-blue-500/10 hover:bg-blue-500/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition">
                Ücretsiz Hesap Oluştur
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-5">
            {[
              { icon: Shield, text: 'Orijinal Permolit' },
              { icon: Truck, text: 'Erzurum Teslimat' },
              { icon: Package, text: 'Teknik Destek' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-blue-300/60 text-xs font-medium">
                <div className="w-6 h-6 bg-blue-500/15 rounded-lg flex items-center justify-center">
                  <Icon size={12} className="text-blue-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider kontrolleri — z-20, içerik z-10'un üstünde */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-4">
        <button onClick={prev}
          className="w-9 h-9 bg-white/10 hover:bg-white/25 border border-white/20 rounded-xl flex items-center justify-center text-white transition">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
          ))}
        </div>
        <button onClick={next}
          className="w-9 h-9 bg-white/10 hover:bg-white/25 border border-white/20 rounded-xl flex items-center justify-center text-white transition">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState({})
  const addItem = useCartStore(s => s.addItem)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
    const channel = supabase.channel('products-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const handleAdd = (product) => {
    if (!user) { navigate('/giris-yap'); return }
    addItem(product, 1)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500)
  }

  const scrollToProducts = () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  const CARD_BG = [
    'from-blue-600 to-blue-800',
    'from-sky-600 to-sky-800',
    'from-indigo-600 to-indigo-800',
    'from-cyan-600 to-cyan-800',
    'from-blue-700 to-slate-700',
    'from-slate-600 to-blue-700',
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onCategorySelect={setCategory} activeCategory={category} />
      <HeroSlider user={user} onScroll={scrollToProducts} />

      {/* Arama */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 focus-within:border-blue-400 focus-within:bg-white rounded-2xl px-4 transition-all">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Ürün ara... permomax, astar, sprey..."
              className="flex-1 py-3.5 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400" />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs font-medium transition px-1">
                Temizle ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ürünler */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {category ? category : search ? `"${search}" sonuçları` : 'Tüm Ürünler'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{filtered.length} ürün</p>
          </div>
          {(category || search) && (
            <button onClick={() => { setSearch(''); setCategory(null) }}
              className="text-xs text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl transition">
              Filtreyi Kaldır ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="h-40 sm:h-48 bg-slate-100" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Package size={26} className="text-blue-300" />
            </div>
            <p className="font-semibold text-slate-500 mb-1">Ürün bulunamadı</p>
            <p className="text-slate-400 text-sm mb-5">Arama kriterlerinizi değiştirin</p>
            <button onClick={() => { setSearch(''); setCategory(null) }}
              className="text-sm text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition">
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((product, i) => (
              <div key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-300 group flex flex-col">

                <div onClick={() => navigate(`/urun/${product.id}`)}
                  className="relative overflow-hidden cursor-pointer flex-shrink-0"
                  style={{ height: '160px' }}>
                  {product.image_url ? (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <img src={optimizeUrl(product.image_url, 400)} alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${CARD_BG[i % CARD_BG.length]} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,.3) 8px, rgba(255,255,255,.3) 16px)' }} />
                      <span className="text-4xl sm:text-5xl drop-shadow-lg relative z-10">🪣</span>
                    </div>
                  )}
                  {product.category && (
                    <span className="absolute top-2 left-2 bg-black/25 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white font-bold text-xs bg-red-500 px-2.5 py-1 rounded-lg">Stok Yok</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Son {product.stock}
                    </span>
                  )}
                </div>

                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 onClick={() => navigate(`/urun/${product.id}`)}
                    className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug mb-1 hover:text-blue-600 transition cursor-pointer">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1 mb-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-50">
                    <span className="text-base sm:text-lg font-black text-blue-700">
                      ₺{Number(product.price).toFixed(2)}
                    </span>
                    <button onClick={() => handleAdd(product)} disabled={product.stock === 0}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all
                        ${added[product.id] ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'}
                        disabled:opacity-30 disabled:cursor-not-allowed`}>
                      <ShoppingCart size={11} />
                      <span className="hidden sm:inline">
                        {!user ? 'Giriş Yap' : added[product.id] ? 'Eklendi!' : 'Ekle'}
                      </span>
                      <span className="sm:hidden">{added[product.id] ? '✓' : '+'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}