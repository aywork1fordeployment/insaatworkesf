import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { optimizeUrl } from '../lib/cloudinary'
import useAuthStore from '../store/authStore'
import useCartStore, { getCartKey } from '../store/cartStore'
import Navbar from '../components/Navbar'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Cart() {
  const { user } = useAuthStore()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const total = getTotal()

  const handleOrder = async () => {
    setLoading(true)
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_price: total,
          customer_note: note || items.map(i => {
            const label = i.product.variant_label ? ` (${i.product.variant_label})` : ''
            return `${i.product.name}${label} x${i.quantity}`
          }).join(', '),
          order_items: items.map(i => ({
            product_id: i.product.id,
            variant_id: i.product.variant_id || null,
            name: i.product.name,
            variant_label: i.product.variant_label || null,
            quantity: i.quantity,
            price: i.product.price,
          })),
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Stok düşme: varyant varsa product_variants, yoksa products tablosundan
      for (const item of items) {
        if (item.product.variant_id) {
          // Güncel stoku önce çek, sonra düş (race condition önlemi)
          const { data: varRow } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.product.variant_id)
            .single()
          if (varRow) {
            await supabase
              .from('product_variants')
              .update({ stock: varRow.stock - item.quantity })
              .eq('id', item.product.variant_id)
          }
        } else {
          const { data: prodRow } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product.id)
            .single()
          if (prodRow) {
            await supabase
              .from('products')
              .update({ stock: prodRow.stock - item.quantity })
              .eq('id', item.product.id)
          }
        }
      }

      supabase.from('order_logs').insert({
        order_id: orderData.id,
        action: 'siparis_olusturuldu',
        note: `Yeni sipariş oluşturuldu. Tutar: ₺${total.toFixed(2)} | ${items.map(i => {
          const label = i.product.variant_label ? ` (${i.product.variant_label})` : ''
          return `${i.product.name}${label} x${i.quantity}`
        }).join(', ')}`,
      })

      clearCart()
      setSuccess(true)
      setTimeout(() => navigate('/siparislerim'), 2000)
    } catch (err) {
      console.error('Sipariş hatası:', err)
      alert('Sipariş verilemedi: ' + err.message)
    }
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sipariş Verildi!</h2>
        <p className="text-slate-500">Siparişlerim sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Sepetim</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-semibold text-slate-400 mb-4">Sepetiniz boş</p>
            <button onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">

            {/* Ürünler */}
            <div className="md:col-span-2 flex flex-col gap-3">
              {items.map(({ product, quantity }) => {
                const cartKey = getCartKey(product)
                return (
                  <div key={cartKey} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex gap-4">
                      {/* Görsel */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center border border-slate-100">
                        {product.image_url ? (
                          <img src={optimizeUrl(product.image_url, 160)} alt={product.name}
                            className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-3xl">🪣</span>
                        )}
                      </div>

                      {/* Bilgi */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug mb-0.5">
                          {product.name}
                        </h3>

                        {/* Varyant etiketi */}
                        {product.variant_label && (
                          <span className="inline-block text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mb-1">
                            {product.variant_label}
                          </span>
                        )}

                        <p className="text-blue-600 font-bold text-base">
                          ₺{Number(product.price).toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Miktar */}
                          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                            <button onClick={() => updateQuantity(cartKey, quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 transition">
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-slate-900">{quantity}</span>
                            <button onClick={() => updateQuantity(cartKey, quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 transition">
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">
                              ₺{(Number(product.price) * quantity).toFixed(2)}
                            </span>
                            <button onClick={() => removeItem(cartKey)}
                              className="text-slate-300 hover:text-red-400 transition p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Özet */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit md:sticky md:top-24">
              <h2 className="font-bold text-slate-900 mb-4">Sipariş Özeti</h2>

              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Ara Toplam</span>
                <span>₺{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 mb-4">
                <span>Kargo</span>
                <span className="text-green-600 font-medium">Ücretsiz</span>
              </div>
              <div className="border-t border-slate-100 pt-3 mb-4">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Toplam</span>
                  <span className="text-blue-600 text-lg">₺{total.toFixed(2)}</span>
                </div>
              </div>

              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Sipariş notu (opsiyonel)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none h-20 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder-slate-400" />

              <button onClick={handleOrder} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50">
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Sipariş Ver</span><ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}