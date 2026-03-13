import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useCartStore from '../store/cartStore'
import Navbar from '../components/Navbar'
import { optimizeUrl } from '../lib/cloudinary'
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [allVariants, setAllVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    const load = async () => {
      const [{ data: prod }, { data: vars }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_variants').select('*').eq('product_id', id).order('price')
      ])

      setProduct(prod)

      // Base ürünü her zaman ilk seçenek olarak dahil et
      const baseVariant = {
        id: 'base',
        label: prod?.base_label || 'Standart',
        price: prod?.price,
        stock: prod?.stock,
        isBase: true,
      }

      const combined = [baseVariant, ...(vars || [])]
      setAllVariants(combined)
      setSelectedVariant(combined[0])
    }
    load()
    window.scrollTo(0, 0)
  }, [id])

  const activePrice = selectedVariant?.price ?? product?.price
  const activeStock = selectedVariant?.stock ?? product?.stock

  const handleAdd = () => {
    if (!product) return
    const cartItem = {
      ...product,
      price: activePrice,
      stock: activeStock,
      variant_label: selectedVariant?.label || null,
      ...(selectedVariant && !selectedVariant.isBase && {
        variant_id: selectedVariant.id,
      }),
    }
    addItem(cartItem, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  const outOfStock = !activeStock || activeStock === 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 text-sm transition">
          <ArrowLeft size={16} /> Geri
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2">

            {/* Görsel */}
            <div className={`${product.image_url ? 'bg-gray-100' : 'bg-gradient-to-br from-blue-600 to-blue-800'} flex items-center justify-center min-h-72 relative overflow-hidden group`}>
              {product.image_url ? (
                <img
                  src={optimizeUrl(product.image_url, 600)}
                  alt={product.name}
                  className="w-full h-full object-contain absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,.15) 15px, rgba(255,255,255,.15) 30px)' }} />
                  <span className="text-8xl">🪣</span>
                </>
              )}
            </div>

            {/* Detaylar */}
            <div className="p-10 flex flex-col justify-center">

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  outOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                }`}>
                  {outOfStock ? 'Stok yok' : `${activeStock} adet stokta`}
                </span>
                {product.category && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                    {product.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-relaxed">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-slate-500 mb-5 leading-relaxed text-sm">{product.description}</p>
              )}

              {/* Varyant seçimi — her zaman var (en az base) */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Seçenek</p>
                <div className="flex flex-wrap gap-2">
                  {allVariants.map(v => {
                    const isSelected = selectedVariant?.id === v.id
                    const noStock = !v.stock || v.stock === 0
                    return (
                      <button
                        key={v.id}
                        onClick={() => { if (!noStock) { setSelectedVariant(v); setQuantity(1) } }}
                        disabled={noStock}
                        className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                            : noStock
                              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                        }`}>
                        <span>{v.label}</span>
                        <span className={`block text-[10px] font-bold mt-0.5 ${
                          isSelected ? 'text-blue-100' : noStock ? 'text-slate-300' : 'text-blue-500'
                        }`}>
                          ₺{Number(v.price).toFixed(2)}
                        </span>
                        {noStock && (
                          <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-400 text-white px-1.5 py-0.5 rounded-full font-bold">
                            Tükendi
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Fiyat */}
              <div className="text-4xl font-bold text-blue-600 mb-6">
                ₺{Number(activePrice).toFixed(2)}
              </div>

              {/* Miktar */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-slate-600">Miktar:</span>
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(activeStock || 1, q + 1))}
                    disabled={outOfStock}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition disabled:opacity-40">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition
                  ${added ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  disabled:opacity-40 disabled:cursor-not-allowed`}>
                <ShoppingCart size={18} />
                {added ? '✓ Sepete Eklendi!' : 'Sepete Ekle'}
                {selectedVariant && !added && (
                  <span className="text-xs opacity-75 ml-1">— {selectedVariant.label}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}