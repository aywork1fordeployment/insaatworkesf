import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ScrollText, Search } from 'lucide-react'

const ACTION_META = {
  'siparis_olusturuldu':  { cls: 'bg-blue-100 text-blue-700',    icon: '🛒', label: 'Sipariş Oluştu' },
  'durum_guncellendi':    { cls: 'bg-gray-100 text-gray-600',    icon: '🔄', label: 'Durum Güncellendi' },
  'iskonto_eklendi':      { cls: 'bg-green-100 text-green-700',  icon: '💸', label: 'İskonto Eklendi' },
  'siparis_iptal':        { cls: 'bg-red-100 text-red-600',      icon: '❌', label: 'Sipariş İptal' },
  'siparis_tamamlandi':   { cls: 'bg-purple-100 text-purple-700',icon: '✅', label: 'Tamamlandı' },
  'urun_eklendi':         { cls: 'bg-teal-100 text-teal-700',    icon: '📦', label: 'Ürün Eklendi' },
  'urun_guncellendi':     { cls: 'bg-yellow-100 text-yellow-700',icon: '✏️', label: 'Ürün Güncellendi' },
  'urun_silindi':         { cls: 'bg-orange-100 text-orange-700',icon: '🗑️', label: 'Ürün Silindi' },
}

const FILTERS = [
  { value: 'all',      label: 'Tümü' },
  { value: 'orders',   label: 'Siparişler' },
  { value: 'products', label: 'Ürünler' },
]

const ORDER_ACTIONS = ['siparis_olusturuldu','durum_guncellendi','iskonto_eklendi','siparis_iptal','siparis_tamamlandi']
const PRODUCT_ACTIONS = ['urun_eklendi','urun_guncellendi','urun_silindi']

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('order_logs_view').select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) {
          // view yoksa fallback
          supabase.from('order_logs').select('*')
            .order('created_at', { ascending: false })
            .limit(200)
            .then(({ data }) => { setLogs(data || []); setLoading(false) })
        } else {
          setLogs(data || [])
          setLoading(false)
        }
      })
  }, [])

  const filtered = logs.filter(l => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'orders' ? ORDER_ACTIONS.includes(l.action) :
      PRODUCT_ACTIONS.includes(l.action)

    const matchSearch = !search ||
      l.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.note?.toLowerCase().includes(search.toLowerCase()) ||
      String(l.order_id)?.includes(search)

    return matchFilter && matchSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Loglar</h2>
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition
                ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Arama */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 mb-5">
        <Search size={14} className="text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Müşteri adı, sipariş no veya not ara..."
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        {search && <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600">Temizle</button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-xs text-gray-400">{filtered.length} kayıt</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <ScrollText size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Log bulunamadı.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(log => {
              const meta = ACTION_META[log.action] || { cls: 'bg-gray-100 text-gray-600', icon: '📋', label: log.action }
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg bg-gray-50 mt-0.5">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {log.order_id && (
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
                          Sipariş #{log.order_id}
                        </span>
                      )}
                      {log.customer_name && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          👤 {log.customer_name}
                        </span>
                      )}
                    </div>
                    {log.note && (
                      <p className="text-sm text-gray-600 leading-relaxed">{log.note}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}