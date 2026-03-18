import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { optimizeUrl } from '../lib/cloudinary'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import {
  ShoppingCart, Search, Package, Shield, Truck,
  ChevronRight, ChevronLeft, Zap, ArrowRight, Tag, Flame, BadgeCheck
} from 'lucide-react'

// ─── İndirim Slide ────────────────────────────────────────────────────────────
function DiscountSlide({ slide, product, discount, onScroll }) {
  const navigate = useNavigate()

  const discountRate = discount ? Number(discount.rate) : 0
  const discountedPrice = product ? Number(product.price) * (1 - discountRate / 100) : null
  const discountLabel = `%${discountRate.toFixed(0)} İndirim`

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '680px', background: '#020c24' }}>

      {/* indirim.png — tam alan, çok düşük opacity, sadece doku */}
      <img
        src="/indirim.png"
        alt="İndirim arka plan görseli"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        style={{ opacity: 0.12, filter: 'saturate(0.5) blur(0.5px)' }}
      />

      {/* Sol taraf derinlik ışığı */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 80% at 18% 50%, rgba(14,60,180,0.4) 0%, transparent 100%)' }} />

      {/* Sağ taraf ürün ışığı */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 45% 70% at 80% 50%, rgba(30,90,220,0.25) 0%, transparent 100%)' }} />

      {/* Sol koyu blok — metni net yapar */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(100deg, rgba(2,12,36,0.95) 0%, rgba(2,12,36,0.75) 42%, rgba(2,12,36,0.1) 68%, transparent 100%)' }} />

      {/* İçerik wrapper */}
<div className="relative z-10 max-w-7xl mx-auto flex items-center h-full px-5 md:px-10 py-8 pb-20 lg:py-12 lg:pb-12">
<div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 lg:gap-16">
          {/* ── MOBİL ÜSTTE: ürün görseli ── */}
   {product && (
  <div className="lg:hidden flex flex-col items-center justify-center w-full pt-2 order-first">
    <div
      onClick={() => navigate(`/urun/${product.id}`)}
      className="relative cursor-pointer flex items-center justify-center"
      style={{ width: '160px', height: '160px' }}>
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)' }} />
      {product.image_url ? (
        <img
  src={optimizeUrl(product.image_url, 400)}
  alt={`${product.name} - İndirimli ürün`}
          className="w-full h-full object-contain relative z-10"
          style={{ filter: 'drop-shadow(0 0 24px rgba(59,130,246,0.75)) drop-shadow(0 6px 20px rgba(0,0,40,0.9))' }}
        />
      ) : (
        <span className="text-7xl relative z-10" style={{ filter: 'drop-shadow(0 0 24px rgba(59,130,246,0.75))' }}>🪣</span>
      )}
      <div className="absolute -top-2 -right-2 z-20 bg-blue-600 text-white font-black text-[10px] px-2 py-1 rounded-xl shadow-lg"
        style={{ transform: 'rotate(7deg)' }}>
        {discountLabel}
      </div>
      {product.stock === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40">
          <span className="text-white font-bold text-xs bg-red-500 px-2.5 py-1 rounded-xl">Stok Yok</span>
        </div>
      )}
    </div>
    <div className="text-center mt-1">
      <span className="text-white text-xs font-bold line-clamp-1">{product.name}</span>
    </div>
  </div>
)}

          {/* ── SOL: metin ── */}
          <div className="flex-1 max-w-xl w-full">

<div className="flex items-center gap-2 flex-wrap mb-2 lg:mb-6">
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-900/40 animate-pulse">
                <Flame size={10} /> Şokk İndirim
              </span>
              <span className="inline-flex items-center gap-1.5 border border-green-400/50 bg-green-400/10 text-green-300 text-[11px] font-black px-3 py-1.5 rounded-full">
                <Tag size={10} /> {discountLabel}
              </span>
            </div>

<h1 className="font-black leading-tight tracking-tight mb-1 lg:mb-3"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}>
              <span className="text-white block">{slide.title}</span>
              <span className="text-blue-400 block">{slide.highlight}</span>
            </h1>

          <p className="text-blue-200/55 text-sm mb-2 lg:mb-7 leading-relaxed">
{slide.description}</p>

            {product && (
<div className="flex items-baseline gap-3 mb-2 lg:mb-8">
                {discountedPrice !== null ? (
                  <>
                    <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                      ₺{discountedPrice.toFixed(2)}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-base text-blue-300/60 line-through">₺{Number(product.price).toFixed(2)}</span>
                      <span className="text-[11px] font-black text-green-300">{discountLabel}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                    ₺{Number(product.price).toFixed(2)}
                  </span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-xs font-bold text-orange-300 border border-orange-400/30 bg-orange-400/10 px-2.5 py-1 rounded-full">
                    Son {product.stock} adet!
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="text-xs font-bold text-red-300 border border-red-400/30 bg-red-400/10 px-2.5 py-1 rounded-full">
                    Stok Tükendi
                  </span>
                )}
              </div>
            )}

<div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mb-2 lg:mb-9">
              {product ? (
                <>
                  <button onClick={() => navigate(`/urun/${product.id}`)} disabled={product.stock === 0}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-2xl shadow-blue-950 group disabled:opacity-50">
                    <ShoppingCart size={16} /> Hemen Al
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={onScroll}
                    className="flex items-center justify-center gap-2 border border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all">
                    Tüm Ürünler
                  </button>
                </>
              ) : (
                <button onClick={onScroll}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 w-full sm:w-auto px-8 py-2.5 lg:py-3.5 rounded-2xl font-bold text-sm  transition-all shadow-2xl shadow-blue-950 group">
                  <ShoppingCart size={16} /> Fırsatları Gör
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

<div className="hidden lg:flex flex-wrap gap-5">
              {[
                { icon: Shield, text: 'Orijinal Permolit' },
                { icon: Truck, text: 'Erzurum Teslimat' },
                { icon: Package, text: 'Teknik Destek' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-blue-300/45 text-xs font-medium">
                  <div className="w-6 h-6 bg-blue-500/15 rounded-lg flex items-center justify-center">
                    <Icon size={12} className="text-blue-400" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── SAĞ: ürün showcase ── */}
          {product && (
            <div
              className="hidden lg:flex items-center justify-center flex-shrink-0"
              style={{ width: '360px', height: '360px' }}>

              <div
                onClick={() => navigate(`/urun/${product.id}`)}
                className="relative w-full h-full cursor-pointer group flex items-center justify-center">

                {/* Büyük dış glow */}
                <div className="absolute -inset-12 rounded-full pointer-events-none transition-all duration-700 group-hover:scale-105"
                  style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(29,78,216,0.08) 50%, transparent 75%)' }} />

                {/* Orta glow */}
                <div className="absolute -inset-4 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)' }} />

                {/* Dönen dekoratif halkalar */}
                <div className="absolute inset-10 rounded-full border border-blue-400/20 pointer-events-none"
                  style={{ animation: 'spin 25s linear infinite' }} />
                <div className="absolute inset-20 rounded-full border border-blue-300/12 pointer-events-none"
                  style={{ animation: 'spin 18s linear infinite reverse' }} />

                {/* İndirim rozeti */}
                <div
                  className="absolute z-20 bg-blue-600 text-white font-black text-sm px-3.5 py-2 rounded-2xl shadow-2xl shadow-blue-900/60 pointer-events-none"
                  style={{ top: '12%', right: '8%', transform: 'rotate(8deg)' }}>
                  {discountLabel}
                </div>

                {/* Son X adet */}
                {product.stock > 0 && product.stock <= 5 && (
                  <div className="absolute z-20 bg-orange-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-lg pointer-events-none"
                    style={{ top: '12%', left: '8%' }}>
                    Son {product.stock} adet
                  </div>
                )}

                {/* Stok yok */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                    <span className="text-white font-bold text-base bg-red-500 px-4 py-2 rounded-2xl">Stok Yok</span>
                  </div>
                )}

                {/* ÜRÜN GÖRSELİ */}
                {product.image_url ? (
                 <img
  src={optimizeUrl(product.image_url, 700)}
  alt={`${product.name} - Ürün görseli`}
                    className="relative z-10 w-[95%] h-[95%] object-contain transition-transform duration-500 group-hover:scale-105"
                    style={{
                      filter: 'drop-shadow(0 0 48px rgba(59,130,246,0.65)) drop-shadow(0 24px 64px rgba(0,0,50,0.95))',
                    }}
                  />
                ) : (
                  <span className="text-[9rem] relative z-10 transition-transform duration-500 group-hover:scale-105 select-none"
                    style={{ filter: 'drop-shadow(0 0 48px rgba(59,130,246,0.65))' }}>
                    🪣
                  </span>
                )}

                {/* Alt ürün adı */}
                <div className="absolute bottom-6 left-1/2 z-20 pointer-events-none"
                  style={{ transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full">
                    {product.name.length > 34 ? product.name.slice(0, 34) + '…' : product.name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PartnerSlide({ slide, product, user, onScroll }) {
  const navigate = useNavigate()

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '680px', background: '#020c24' }}>

{slide.brand_logo_url && (
  <img
  src={`https://res.cloudinary.com/du3yhj9dv/image/upload/w_1400,q_60,f_auto/${slide.brand_logo_url.split('/upload/')[1]}`}
  alt={`${slide.title || 'Partner'} - Marka görseli`}
    aria-hidden="true"
    fetchPriority="high"
    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
  />
)}
      {/* Karartma overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(100deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.35) 50%, rgba(15,23,42,0.15) 100%)' }} />

<div className="relative z-10 max-w-7xl mx-auto flex items-center h-full px-5 md:px-10 py-8 pb-20">
          <div className="flex flex-col w-full max-w-xl gap-5">

          {/* Rozetler */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
              <BadgeCheck size={11} className="text-sky-400" /> Resmi Yetkili Bayi
            </div>
            {slide.badge && (
              <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-blue-200/70 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                <Zap size={10} className="text-sky-400" /> {slide.badge}
              </div>
            )}
          </div>


          {/* Başlık */}
          {(slide.title || slide.highlight) && (
            <h1 className="font-black leading-tight tracking-tight" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}>
              {slide.title && <span className="text-white block">{slide.title}</span>}
              {slide.highlight && <span className="text-blue-400 block">{slide.highlight}</span>}
            </h1>
          )}

          {slide.description && (
            <p className="text-blue-200/55 text-sm leading-relaxed max-w-md">{slide.description}</p>
          )}

          {/* Butonlar */}
<div className="flex flex-col sm:flex-row gap-3">
                {product ? (
              <>
                <button onClick={() => navigate(`/urun/${product.id}`)}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm
 transition-all shadow-2xl shadow-blue-950 group">
                  <ShoppingCart size={16} /> Ürünlere Göz At
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onScroll}
                  className="flex items-center justify-center gap-2 border border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all">
                  Tüm Ürünler
                </button>
              </>
            ) : (
              <>
                <button onClick={onScroll}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm
 transition-all shadow-2xl shadow-blue-950 group">
                  <ShoppingCart size={16} /> Ürünleri Keşfet
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {!user && (
                  <Link to="/kayit-ol"
                    className="flex items-center justify-center gap-2 border border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all">
                    Ücretsiz Hesap Oluştur
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Alt ikonlar */}
          <div className="flex flex-wrap gap-3 lg:gap-5 mt-1">
            {[
              { icon: Shield, text: 'Orijinal Permolit' },
              { icon: Truck, text: 'Erzurum Teslimat' },
              { icon: Package, text: 'Teknik Destek' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-blue-300/45 text-xs font-medium">
                <div className="w-6 h-6 bg-blue-500/15 rounded-lg flex items-center justify-center">
                  <Icon size={12} className="text-blue-400" />
                </div>
                {text}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
// ─── Normal Slide ─────────────────────────────────────────────────────────────
function NormalSlide({ slide, product, user, onScroll }) {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900" style={{ height: '680px' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-sky-400/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

<div className="relative z-10 max-w-7xl mx-auto flex items-center h-full px-6 py-8 pb-20">       
   <div className={`flex flex-col gap-8 w-full ${product ? 'lg:flex-row lg:items-center lg:gap-16' : ''}`}>
          <div className={`${product ? 'lg:flex-1' : 'max-w-2xl'}`}>
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {slide.badge && (
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                  <Zap size={10} /> {slide.badge}
                </div>
              )}
              {slide.discount_text && (
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 text-green-300 text-[11px] font-bold px-3 py-1.5 rounded-full animate-pulse">
                  <Tag size={10} className="text-green-400" /> {slide.discount_text}
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-5">
              <span className="text-white">{slide.title}</span><br />
              <span className="text-blue-400">{slide.highlight}</span>
            </h1>
            <p className="text-blue-200/70 text-sm sm:text-base mb-8 leading-relaxed max-w-lg">{slide.description}</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              {product ? (
                <>
                  <button onClick={() => navigate(`/urun/${product.id}`)}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-xl shadow-black/20 group">
                    <ShoppingCart size={16} /> Hemen Al
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={onScroll}
                    className="flex items-center justify-center gap-2 border border-blue-400/30 hover:border-blue-400/60 bg-blue-500/10 hover:bg-blue-500/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition">
                    Tüm Ürünler
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onScroll}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-xl shadow-black/20 group">
                    <ShoppingCart size={16} /> Ürünleri Keşfet
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  {!user && (
                    <Link to="/kayit-ol"
                      className="flex items-center justify-center gap-2 border border-blue-400/30 hover:border-blue-400/60 bg-blue-500/10 hover:bg-blue-500/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition">
                      Ücretsiz Hesap Oluştur
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-5">
              {[{ icon: Shield, text: 'Orijinal Permolit' }, { icon: Truck, text: 'Erzurum Teslimat' }, { icon: Package, text: 'Teknik Destek' }]
                .map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-blue-300/60 text-xs font-medium">
                    <div className="w-6 h-6 bg-blue-500/15 rounded-lg flex items-center justify-center">
                      <Icon size={12} className="text-blue-400" />
                    </div>
                    {text}
                  </div>
                ))}
            </div>
          </div>

          {product && (
<div className="lg:w-80 xl:w-96 flex-shrink-0 order-first lg:order-last">              <div onClick={() => navigate(`/urun/${product.id}`)} className="relative cursor-pointer group">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/30 via-sky-400/20 to-transparent rounded-3xl blur-xl group-hover:from-blue-400/50 transition-all duration-500" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden">
                  <div className="relative bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center" style={{ height: '220px' }}>
                    {product.image_url
                      ? <img src={optimizeUrl(product.image_url, 500)} alt={product.name} className="h-full w-full object-contain p-6 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                      : <span className="text-8xl drop-shadow-2xl group-hover:scale-105 transition-transform duration-500">🪣</span>
                    }
                    {slide.discount_text && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl">{slide.discount_text}</div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Son {product.stock} adet</div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-t-3xl">
                        <span className="text-white font-bold text-sm bg-red-500 px-3 py-1.5 rounded-xl">Stok Yok</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-white font-bold text-base leading-snug line-clamp-2 mb-1 group-hover:text-blue-200 transition">{product.name}</p>
                    {product.description && <p className="text-blue-300/60 text-xs line-clamp-1 mb-3">{product.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">₺{Number(product.price).toFixed(2)}</span>
                      <div className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition">
                        <ShoppingCart size={13} /> İncele
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-400/20 blur-xl rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Hero Slider ─────────────────────────────────────────────────────────────
function HeroSlider({ user, onScroll }) {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [productMap, setProductMap] = useState({})
  const [discountMap, setDiscountMap] = useState({}) // productId → discount
  const timerRef = useRef()

  useEffect(() => {
    supabase.from('slides').select('*').eq('is_active', true).order('sort_order')
      .then(async ({ data }) => {
        const slides = data || []
        setSlides(slides)
        const ids = [...new Set(slides.filter(s => s.product_id).map(s => s.product_id))]
        if (ids.length > 0) {
          const now = new Date().toISOString()
          const [{ data: prods }, { data: discs }] = await Promise.all([
            supabase.from('products')
              .select('id, name, price, stock, image_url, description').in('id', ids),
            supabase.from('discounts')
              .select('*').eq('is_active', true)
              .lte('start_date', now).gte('end_date', now)
              .in('product_id', ids),
          ])
          const pMap = {}
          prods?.forEach(p => { pMap[p.id] = p })
          setProductMap(pMap)

          const dMap = {}
          discs?.forEach(d => { dMap[d.product_id] = d })
          setDiscountMap(dMap)
        }
      })
  }, [])

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000)
  }

  useEffect(() => {
    if (slides.length === 0) return
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [slides])

  const next = () => { setCurrent(c => (c + 1) % slides.length); startTimer() }
  const prev = () => { setCurrent(c => (c - 1 + slides.length) % slides.length); startTimer() }
  const go = (idx) => { setCurrent(idx); startTimer() }

  if (slides.length === 0) return (
    <section className="relative overflow-hidden" style={{ height: 'auto', minHeight: '680px' }}>
      <div className="flex items-center justify-center min-h-[520px]">
        <div className="w-8 h-8 border-4 border-blue-400/40 border-t-blue-300 rounded-full animate-spin" />
      </div>
    </section>
  )

  const slide = slides[current]
  const product = slide.product_id ? productMap[slide.product_id] : null
  const discount = product ? discountMap[product.id] : null

  const isDiscount = !!(product && discount)
  const isPartner = !!slide.brand_logo_url && !isDiscount

  return (
<section className="relative overflow-hidden" style={{ height: '680px' }}>

      {isDiscount
        ? <DiscountSlide slide={slide} product={product} discount={discount} onScroll={onScroll} />
        : isPartner
        ? <PartnerSlide slide={slide} product={product} user={user} onScroll={onScroll} />
        : <NormalSlide slide={slide} product={product} user={user} onScroll={onScroll} />
      }
    {slides.length > 1 && (
  <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-4">
    <button aria-label="Önceki slide" onClick={prev} className="w-9 h-9 bg-white/10 hover:bg-white/25 border border-white/20 rounded-xl flex items-center justify-center text-white transition">
      <ChevronLeft size={16} />
    </button>
    <div className="flex items-center gap-2">
      {slides.map((_, i) => (
        <button key={i} aria-label={`Slide ${i+1}'e git`} onClick={() => go(i)}
          className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
      ))}
    </div>
    <button aria-label="Sonraki slide" onClick={next} className="w-9 h-9 bg-white/10 hover:bg-white/25 border border-white/20 rounded-xl flex items-center justify-center text-white transition">
      <ChevronRight size={16} />
    </button>
  </div>
)}
    </section>
  )
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState([])
  const [discountMap, setDiscountMap] = useState({}) // productId → discount
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState({})
  const addItem = useCartStore(s => s.addItem)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      const now = new Date().toISOString()
      const [{ data: prods }, { data: discs }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('discounts').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now),
      ])
      setProducts(prods || [])
      // productId → discount map
      const map = {}
      discs?.forEach(d => { map[d.product_id] = d })
      setDiscountMap(map)
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
    const discount = discountMap[product.id]
    const discountRate = discount ? Number(discount.rate) : 0
    const finalPrice = discountRate > 0
      ? Number(product.price) * (1 - discountRate / 100)
      : Number(product.price)
    addItem({
      ...product,
      price: finalPrice,
      original_price: Number(product.price),
      discount_rate: discountRate,
    }, 1)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500)
  }

  const scrollToProducts = () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })

  const filtered = products.filter(p => {
    const normalize = (str) =>
  str?.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')

const matchSearch = normalize(p.name)?.includes(normalize(search))
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  const CARD_BG = [
    'from-blue-600 to-blue-800', 'from-sky-600 to-sky-800',
    'from-indigo-600 to-indigo-800', 'from-cyan-600 to-cyan-800',
    'from-blue-700 to-slate-700', 'from-slate-600 to-blue-700',
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onCategorySelect={setCategory} activeCategory={category} />
      <HeroSlider user={user} onScroll={scrollToProducts} />

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

      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {category ? category : search ? `"${search}" sonuçları` : 'Tüm Ürünler'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">{filtered.length} ürün</p>
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
            {filtered.map((product, i) => {
              const discount = discountMap[product.id]
              const discountRate = discount ? Number(discount.rate) : 0
              const discountedPrice = discountRate > 0
                ? Number(product.price) * (1 - discountRate / 100)
                : null

              return (
              <div key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-300 group flex flex-col">
                <div onClick={() => navigate(`/urun/${product.id}`)}
                  className="relative overflow-hidden cursor-pointer flex-shrink-0"
                  style={{ height: '160px' }}>
                {product.image_url ? (
  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
    {(() => {
      const { src, srcSet, sizes } = getResponsiveSrcSet(product.image_url)
      return (
        <img 
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )
    })()}
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
                  {/* İndirim rozeti */}
                  {discountRate > 0 && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -%{discountRate.toFixed(0)}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white font-bold text-xs bg-red-500 px-2.5 py-1 rounded-lg">Stok Yok</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && discountRate === 0 && (
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
                   <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mb-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-50">
                    {/* Fiyat: indirimli göster */}
                    <div className="flex flex-col">
                      {discountedPrice !== null ? (
                        <>
                          <span className="text-[10px] text-slate-400 line-through leading-tight">₺{Number(product.price).toFixed(2)}</span>
                          <span className="text-base sm:text-lg font-black text-green-600 leading-tight">₺{discountedPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-base sm:text-lg font-black text-blue-700">₺{Number(product.price).toFixed(2)}</span>
                      )}
                    </div>
                  <button 
  onClick={() => handleAdd(product)} 
  disabled={product.stock === 0}
  aria-label={!user ? 'Sepete eklemek için giriş yapın' : 'Sepete ekle'}
  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all
    ${added[product.id] ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'}
    disabled:opacity-30 disabled:cursor-not-allowed`}>
  <ShoppingCart size={11} />
  <span className="hidden sm:inline">
    {!user ? 'Sepete Ekle' : added[product.id] ? 'Eklendi!' : 'Ekle'}
  </span>
  <span className="sm:hidden">{added[product.id] ? '✓' : '+'}</span>
</button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>
    </div>
  )
}