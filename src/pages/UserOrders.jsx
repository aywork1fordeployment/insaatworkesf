import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import { Package, ChevronRight, X, AlertTriangle } from 'lucide-react'

const STATUS = {
  pending:    { label: 'Bekliyor',     cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  processing: { label: 'Hazırlanıyor', cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  completed:  { label: 'Tamamlandı',   cls: 'bg-green-100 text-green-700',  dot: 'bg-green-400' },
  cancelled:  { label: 'İptal',        cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
}

function ConfirmModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Siparişi İptal Et</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            Vazgeç
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Evet, İptal Et'}
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose, onCancel }) {
  const s = STATUS[order.status] || STATUS.pending
  const base = Number(order.total_price) || 0
  const discount = Number(order.discount_amount) || 0
  const tax = Number(order.tax_amount) || 0
  const final = Number(order.final_price) || base
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // order_items varsa satır bazlı göster
  const orderItems = Array.isArray(order.order_items) ? order.order_items : []

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .eq('status', 'pending')

      if (error) throw error

      await supabase.from('order_logs').insert({
        order_id: order.id,
        action: 'siparis_iptal',
        note: 'Müşteri siparişi iptal etti.',
      })
    } catch (err) {
      console.error('İptal hatası:', err)
      setCancelling(false)
      setShowConfirm(false)
      return
    }
    setCancelling(false)
    setShowConfirm(false)
    onCancel()
    onClose()
  }

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          loading={cancelling}
          onConfirm={handleCancel}
          onClose={() => setShowConfirm(false)}
        />
      )}

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">Sipariş #{order.id}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString('tr-TR')}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Sipariş Durumu</span>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
            </div>

            {/* Ürün satırları */}
            {orderItems.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ürünler</p>
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-700 font-medium truncate">{item.name}</span>
                      {item.variant_label && (
                        <span className="text-[11px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                          {item.variant_label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-gray-400 text-xs">x{item.quantity}</span>
                      <span className="font-semibold text-gray-800">
                        ₺{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ürün Tutarı</span><span>₺{base.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İskonto</span><span>-₺{discount.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>KDV (%{order.tax_rate})</span><span>+₺{tax.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Genel Toplam</span>
                <span className="text-blue-700">₺{final.toFixed(2)}</span>
              </div>
            </div>

            {order.customer_note && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notunuz</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{order.customer_note}</p>
              </div>
            )}

            {order.admin_note && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Mağaza Notu</p>
                <p className="text-sm text-gray-600 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">{order.admin_note}</p>
              </div>
            )}

            {order.status === 'pending' && (
              <button onClick={() => setShowConfirm(true)}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-sm font-semibold transition">
                Siparişi İptal Et
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function UserOrders() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    const result = data || []
    setOrders(result)
    setLoading(false)
    if (selected) {
      const updated = result.find(o => o.id === selected.id)
      if (updated) setSelected(updated)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  useEffect(() => {
    const channel = supabase.channel('user-orders')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [user.id])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onCancel={fetchOrders}
        />
      )}

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Siparişlerim</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Henüz sipariş yok</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const s = STATUS[order.status] || STATUS.pending
              const final = Number(order.final_price) || Number(order.total_price) || 0
              const orderItems = Array.isArray(order.order_items) ? order.order_items : []
              return (
                <div key={order.id} onClick={() => setSelected(order)}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-md transition cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                        #{order.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                          {order.status === 'pending' && (
                            <span className="text-[10px] text-yellow-500 font-medium">· İptal edebilirsiniz</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-700">₺{final.toFixed(2)}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition" />
                    </div>
                  </div>

                  {/* Ürün özeti */}
                  {orderItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-1.5">
                      {orderItems.map((item, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">
                          {item.name}{item.variant_label ? ` · ${item.variant_label}` : ''} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  )}

                  {order.admin_note && (
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-start gap-2">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mt-0.5">Mağaza:</span>
                      <p className="text-xs text-slate-500">{order.admin_note}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}