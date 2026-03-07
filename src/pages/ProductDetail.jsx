import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useCartStore from '../store/cartStore'
import Navbar from '../components/Navbar'
import { optimizeUrl } from '../lib/cloudinary'

import { ShoppingCart, ArrowLeft, Plus, Minus, Package } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
    }
    fetch()
  }, [id])
useEffect(() => {
  window.scrollTo(0, 0)
}, [])
  const handleAdd = () => {
    addItem(product, quantity)
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 text-sm transition">
          <ArrowLeft size={16} /> Geri
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* Image */}
     {/* Image */}
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

            {/* Details */}
            <div className="p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} adet stokta` : 'Stok yok'}
                </span>
              </div>
<h1 className="text-3xl font-bold text-slate-900 mb-3 leading-relaxed">
  {product.name}
</h1>
              {product.description && (
                <p className="text-slate-500 mb-6 leading-relaxed">{product.description}</p>
              )}

              <div className="text-4xl font-bold text-blue-600 mb-8">
                ₺{Number(product.price).toFixed(2)}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-slate-600">Miktar:</span>
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition
                  ${added ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ShoppingCart size={18} />
                {added ? '✓ Sepete Eklendi!' : 'Sepete Ekle'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}