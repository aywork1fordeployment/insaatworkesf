import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, X } from 'lucide-react'

const STATUS_MAP = {
  pending:    { label: 'Bekliyor',     cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Hazırlanıyor', cls: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Tamamlandı',   cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'İptal',        cls: 'bg-red-100 text-red-600' },
}

function ApproveModal({ order, onClose, onSave }) {
  const [discountRate, setDiscountRate] = useState(order.discount_rate || 0)
  const [taxRate, setTaxRate] = useState(order.tax_rate || 20)
  const [adminNote, setAdminNote] = useState(order.admin_note || '')
  const [status, setStatus] = useState(order.status)
  const [restoreStock, setRestoreStock] = useState(false)
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [customFinalPrice, setCustomFinalPrice] = useState('')
  const [cancelledItems, setCancelledItems] = useState(
    (order.order_items || []).reduce((acc, item, i) => ({ ...acc, [i]: item.cancelled || false }), {})
  )

  const toggleItemCancel = (i) => {
    setCancelledItems(prev => ({ ...prev, [i]: !prev[i] }))
  }

  // İptal edilmeyen kalemlerin toplamı
const base = order.order_items?.length
  ? order.order_items.reduce((sum, item, i) => {
      if (cancelledItems[i]) return sum
      return sum + (Number(item.price) * item.quantity)
    }, 0)
  : Number(order.total_price) || 0

const originalBase = Number(order.total_price) || 0
  const discountAmt = base * (Number(discountRate) || 0) / 100
  const afterDiscount = base - discountAmt
  const taxAmt = afterDiscount * taxRate / (100 + taxRate)
  const final = useCustomPrice && customFinalPrice !== ''
    ? Number(customFinalPrice)
    : afterDiscount

  const handleSave = async () => {
    const finalPrice = useCustomPrice && customFinalPrice !== ''
      ? Number(customFinalPrice)
      : afterDiscount

    const updatedItems = order.order_items?.map((item, i) => ({
      ...item,
      cancelled: cancelledItems[i] || false
    })) || []

    await supabase.from('orders').update({
      status,
      discount_rate: useCustomPrice ? 0 : Number(discountRate),
      discount_amount: useCustomPrice ? 0 : discountAmt,
      tax_rate: taxRate,
      tax_amount: afterDiscount * taxRate / (100 + taxRate),
      final_price: finalPrice,
      admin_note: adminNote,
      approved_at: status === 'completed' ? new Date().toISOString() : null,
      order_items: updatedItems,
    }).eq('id', order.id)

    if (status === 'cancelled' && restoreStock && order.order_items?.length) {
      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from('products').select('stock').eq('id', item.product_id).single()
        if (product) {
          await supabase.from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.product_id)
        }
      }
    }

    const cancelledNames = Object.entries(cancelledItems)
      .filter(([, v]) => v)
      .map(([i]) => order.order_items[i]?.name)
      .filter(Boolean)

    const logNote = useCustomPrice
      ? `Durum: ${STATUS_MAP[status]?.label} | Özel fiyat: ₺${finalPrice.toFixed(2)}${cancelledNames.length ? ` | İptal kalemler: ${cancelledNames.join(', ')}` : ''}${restoreStock && status === 'cancelled' ? ' | Stok iade edildi' : ''}${adminNote ? ` | Not: ${adminNote}` : ''}`
      : `Durum: ${STATUS_MAP[status]?.label}${Number(discountRate) > 0 ? ` | İskonto: %${discountRate} (₺${discountAmt.toFixed(2)})` : ''}${cancelledNames.length ? ` | İptal kalemler: ${cancelledNames.join(', ')}` : ''}${restoreStock && status === 'cancelled' ? ' | Stok iade edildi' : ''} | Toplam: ₺${finalPrice.toFixed(2)}${adminNote ? ` | Not: ${adminNote}` : ''}`

    await supabase.from('order_logs').insert({
      order_id: order.id,
      action: status === 'completed' ? 'siparis_tamamlandi' :
              status === 'cancelled' ? 'siparis_iptal' :
              cancelledNames.length ? 'kalem_iptal' :
              useCustomPrice ? 'ozel_fiyat_uygulandi' :
              Number(discountRate) > 0 ? 'iskonto_eklendi' : 'durum_guncellendi',
      note: logNote,
    })

    onSave(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Sipariş #{order.id} — Düzenle</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">

            {/* Durum */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Durum</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {/* Müşteri */}
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(order.full_name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{order.full_name || '—'}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {order.email && <span className="truncate">✉ {order.email}</span>}
                    {order.phone_number && <span>📞 {order.phone_number}</span>}
                  </div>
                </div>
              </div>

              {/* Sipariş kalemleri — tıklanabilir iptal */}
              {order.order_items?.length > 0 ? (
                <div className="border-t border-slate-200 pt-2 mt-1 flex flex-col gap-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                    Sipariş İçeriği
                    <span className="normal-case text-orange-400 font-normal ml-1">— kalemi iptal için tıkla</span>
                  </p>
                  {order.order_items.map((item, i) => (
                    <div key={i}
                      onClick={() => toggleItemCancel(i)}
                      className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-2 cursor-pointer transition select-none border ${
                        cancelledItems[i]
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        {cancelledItems[i]
                          ? <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">İPTAL</span>
                          : <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        }
                        <span className={`font-medium truncate ${cancelledItems[i] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                        <span>{item.quantity} adet</span>
                        <span className={`font-semibold ${cancelledItems[i] ? 'text-red-300 line-through' : 'text-slate-600'}`}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {Object.values(cancelledItems).some(Boolean) && (
                    <p className="text-[10px] text-orange-600 bg-orange-50 rounded-lg px-2.5 py-1.5 border border-orange-100">
                      ⚠️ İptal edilen kalemler müşteriye gösterilecek.
                    </p>
                  )}
                </div>
              ) : order.customer_note ? (
                <div className="border-t border-slate-200 pt-2 mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Sipariş Notu</p>
                  <p className="text-xs text-slate-600">{order.customer_note}</p>
                </div>
              ) : null}
            </div>

            {/* Stok iadesi */}
            {status === 'cancelled' && order.order_items?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={restoreStock} onChange={e => setRestoreStock(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Stoğa iade et</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {order.order_items.map(i => `${i.name} (+${i.quantity})`).join(', ')}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Fiyat */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-3">
            <div className="flex justify-between text-gray-600">
  <span className="flex items-center gap-1.5">
    Ürün Tutarı
    <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-semibold">KDV dahil</span>
  </span>
  <div className="text-right">
    {base !== originalBase && (
      <p className="text-xs text-gray-400 line-through">₺{originalBase.toFixed(2)}</p>
    )}
    <span>₺{base.toFixed(2)}</span>
  </div>
</div>

{base !== originalBase && (
  <div className="flex justify-between text-red-500 text-xs bg-red-50 rounded-lg px-3 py-1.5">
    <span>İptal edilen kalemler</span>
    <span>-₺{(originalBase - base).toFixed(2)}</span>
  </div>
)}
              {!useCustomPrice && (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-gray-600 text-sm">Müşteri İndirimi (%)</p>
                    <p className="text-[10px] text-gray-400">Belirli müşteriye özel indirim</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input type="number" min="0" max="100" value={discountRate}
                      onChange={e => setDiscountRate(e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </div>
              )}

              {!useCustomPrice && Number(discountRate) > 0 && (
                <div className="flex justify-between text-green-600 text-xs bg-green-50 rounded-lg px-3 py-1.5">
                  <span>İndirim (%{discountRate})</span>
                  <span>-₺{discountAmt.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs">KDV Oranı (fiyata dahil)</p>
                  <p className="text-[10px] text-gray-400">Muhasebe için dahili bilgi</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input type="number" min="0" max="100" value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-400 text-xs bg-gray-100 rounded-lg px-3 py-1.5">
                <span>Dahili KDV ({taxRate}%)</span>
                <span>₺{taxAmt.toFixed(2)} (dahil)</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useCustomPrice}
                    onChange={e => { setUseCustomPrice(e.target.checked); if (!e.target.checked) setCustomFinalPrice('') }}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Özel son fiyat uygula</p>
                    <p className="text-[10px] text-gray-400">İskonto yerine direkt fiyat belirle</p>
                  </div>
                </label>
                {useCustomPrice && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₺</span>
                    <input type="number" min="0" value={customFinalPrice}
                      onChange={e => setCustomFinalPrice(e.target.value)}
                      placeholder="Örn: 150.00"
                      className="w-full border-2 border-blue-400 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {customFinalPrice && base > 0 && (
                      <p className="text-[10px] text-green-600 mt-1">
                        ₺{(base - Number(customFinalPrice)).toFixed(2)} indirim
                        ({((base - Number(customFinalPrice)) / base * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Genel Toplam</span>
                <span className="text-blue-700 text-base">₺{final.toFixed(2)}</span>
              </div>
            </div>

            {/* Admin notu */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">ESF Yapı</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                placeholder="Teslimat bilgisi, özel not..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders_with_email')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase.channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') setOrders(prev => [payload.new, ...prev])
        else if (payload.eventType === 'UPDATE') setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        else if (payload.eventType === 'DELETE') setOrders(prev => prev.filter(o => o.id !== payload.old.id))
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search ||
      o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
    return matchStatus && matchSearch
  })

  const counts = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {})

  if (loading) return <div className="text-gray-400 text-sm">Yükleniyor...</div>

  return (
    <div>
      {selectedOrder && (
        <ApproveModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={fetchOrders}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Siparişler</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <button key={k}
            onClick={() => setStatusFilter(statusFilter === k ? 'all' : k)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition text-xs font-semibold ${
              statusFilter === k ? v.cls + ' border-current' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
            }`}>
            <span>{v.label}</span>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              statusFilter === k ? 'bg-white/60' : 'bg-gray-100'
            }`}>{counts[k] || 0}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ad, email veya sipariş no..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">Tümü</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Sipariş bulunamadı.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(order => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.pending
              const base = Number(order.total_price) || 0
              const discount = Number(order.discount_amount) || 0
              const tax = Number(order.tax_amount) || 0
              const discountRate = Number(order.discount_rate) || 0
              const final = Number(order.final_price) || base
              const hascancelledItems = order.order_items?.some(i => i.cancelled)
              return (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-[11px] flex-shrink-0">
                        #{order.id}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{order.full_name || '—'}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${s.cls}`}>{s.label}</span>
                      {hascancelledItems && (
                        <span className="text-[10px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 hidden sm:inline">
                          Kısmi iptal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-blue-700 text-sm">₺{final.toFixed(2)}</p>
                      <button onClick={() => setSelectedOrder(order)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                        Düzenle
                      </button>
                    </div>
                  </div>

                  <div className="pl-10 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {order.email && (
                      <a href={`mailto:${order.email}`} className="text-xs text-gray-400 hover:text-blue-600 transition truncate max-w-[200px]">
                        ✉ {order.email}
                      </a>
                    )}
                    {order.phone_number && (
                      <a href={`tel:${order.phone_number}`} className="text-xs text-gray-400 hover:text-blue-600 transition flex-shrink-0">
                        📞 {order.phone_number}
                      </a>
                    )}
                    <span className="text-xs text-gray-300 flex-shrink-0">
                      {new Date(order.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>

                  {order.customer_note && (
                    <p className="pl-10 text-xs text-slate-500 mt-1 truncate">{order.customer_note.slice(0, 60)}</p>
                  )}

                  {(discount > 0 || tax > 0) && (
                    <div className="pl-10 flex items-center gap-3 mt-1 text-[11px]">
                      {discount > 0 && (
                        <span className="text-green-600">
                          {discountRate > 0 ? `%${discountRate} ` : ''}-₺{discount.toFixed(2)} indirim
                        </span>
                      )}
                      {tax > 0 && <span className="text-gray-400">KDV: ₺{tax.toFixed(2)} (dahil)</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}