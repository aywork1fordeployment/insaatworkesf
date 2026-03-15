import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X, ShoppingBag, Search, Phone, Mail, TrendingUp, Clock, Package, Ban, CheckCircle } from 'lucide-react'

const STATUS_MAP = {
  pending:    { label: 'Bekliyor',     cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Hazırlanıyor', cls: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Tamamlandı',   cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'İptal',        cls: 'bg-red-100 text-red-600' },
}

function CustomerModal({ customer, onClose, onBlockToggle }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    supabase.from('orders').select('*')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [customer.id])

  const totalSpent = Number(customer.total_spent) || 0
  const pendingAmount = Number(customer.pending_amount) || 0
  const orderCount = Number(customer.order_count) || orders.length

  const handleBlockToggle = async () => {
    setBlocking(true)
    const newValue = !customer.is_blocked
    await supabase.from('profiles')
      .update({ is_blocked: newValue })
      .eq('id', customer.id)
    setBlocking(false)
    onBlockToggle(customer.id, newValue)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                customer.is_blocked ? 'bg-red-400' : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                {(customer.full_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{customer.full_name || '—'}</h3>
                  {customer.is_blocked && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ENGELLENDİ</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition">
                      <Mail size={11} />{customer.email}
                    </a>
                  )}
                  {customer.phone_number && (
                    <a href={`tel:${customer.phone_number}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition">
                      <Phone size={11} />{customer.phone_number}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition">
              <X size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package size={13} className="text-blue-400" />
                <p className="text-lg font-bold text-gray-800">{orderCount}</p>
              </div>
              <p className="text-xs text-gray-400">Sipariş</p>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={13} className="text-green-500" />
                <p className="text-lg font-bold text-green-600">₺{totalSpent.toFixed(0)}</p>
              </div>
              <p className="text-xs text-gray-400">Tamamlanan</p>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock size={13} className="text-yellow-500" />
                <p className="text-lg font-bold text-yellow-600">₺{pendingAmount.toFixed(0)}</p>
              </div>
              <p className="text-xs text-gray-400">Bekleyen</p>
            </div>
          </div>

          {/* Siparişler */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">Henüz sipariş yok</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.map(o => {
                  const s = STATUS_MAP[o.status] || STATUS_MAP.pending
                  const final = Number(o.final_price) || Number(o.total_price) || 0
                  return (
                    <div key={o.id} className="px-5 py-3.5 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">#{o.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.cls}`}>{s.label}</span>
                        </div>
                        <span className="font-bold text-blue-700">₺{final.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString('tr-TR')}</p>
                      {o.order_items?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {o.order_items.map((item, i) => (
                            <span key={i} className={`text-[11px] px-2 py-0.5 rounded-lg ${
                              item.cancelled ? 'bg-red-50 text-red-400 line-through' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.name} ×{item.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                      {!o.order_items?.length && o.customer_note && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{o.customer_note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer — engelle/engeli kaldır */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}
              {customer.last_order_at && ` · Son sipariş: ${new Date(customer.last_order_at).toLocaleDateString('tr-TR')}`}
            </p>
            <button
              onClick={handleBlockToggle}
              disabled={blocking}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex-shrink-0 ${
                customer.is_blocked
                  ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}>
              {blocking
                ? <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                : customer.is_blocked
                  ? <><CheckCircle size={14} /> Engeli Kaldır</>
                  : <><Ban size={14} /> Engelle</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const fetchCustomers = () => {
    supabase.from('customers_view').select('*')
      .order('last_order_at', { ascending: false, nullsFirst: false })
      .then(({ data, error }) => {
        if (error) {
          supabase.from('profiles').select('*').eq('role', 'customer')
            .order('created_at', { ascending: false })
            .then(({ data }) => { setCustomers(data || []); setLoading(false) })
        } else {
          setCustomers(data || [])
          setLoading(false)
        }
      })
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleBlockToggle = (id, isBlocked) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_blocked: isBlocked } : c))
    if (selected?.id === id) setSelected(prev => ({ ...prev, is_blocked: isBlocked }))
  }

  const filtered = customers.filter(c =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone_number?.includes(search)
  )

  return (
    <div>
      {selected && (
        <CustomerModal
          customer={selected}
          onClose={() => setSelected(null)}
          onBlockToggle={handleBlockToggle}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Müşteriler <span className="text-gray-400 font-normal text-sm ml-1">({customers.length})</span>
        </h2>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 mb-5">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="İsim, email veya telefon..."
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">
            {search ? 'Sonuç bulunamadı.' : 'Henüz müşteri yok.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(c => {
              const totalSpent = Number(c.total_spent) || 0
              const orderCount = Number(c.order_count) || 0
              return (
                <div key={c.id} onClick={() => setSelected(c)}
                  className={`flex items-center gap-4 px-5 py-3.5 transition cursor-pointer group ${
                    c.is_blocked ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-blue-50'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition ${
                    c.is_blocked
                      ? 'bg-red-100 text-red-500'
                      : 'bg-blue-100 group-hover:bg-blue-200 text-blue-700'
                  }`}>
                    {(c.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm transition ${
                        c.is_blocked ? 'text-red-500' : 'text-gray-800 group-hover:text-blue-700'
                      }`}>{c.full_name || '—'}</p>
                      {c.is_blocked && (
                        <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">ENGELLİ</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.email && <span className="text-xs text-gray-400 truncate">{c.email}</span>}
                      {c.phone_number && <span className="text-xs text-gray-400">{c.phone_number}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-3">
                      {orderCount > 0 && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-700">{orderCount}</p>
                          <p className="text-[10px] text-gray-400">sipariş</p>
                        </div>
                      )}
                      {totalSpent > 0 && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-green-600">₺{totalSpent.toFixed(0)}</p>
                          <p className="text-[10px] text-gray-400">harcama</p>
                        </div>
                      )}
                    </div>
                    {c.last_order_at && (
                      <p className="text-[10px] text-gray-300 mt-1">{new Date(c.last_order_at).toLocaleDateString('tr-TR')}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}