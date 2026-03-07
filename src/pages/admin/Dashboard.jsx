import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cached } from '../../lib/cache'
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, XCircle, Truck, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const EMPTY = { orders: 0, customers: 0, products: 0, revenue: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 }
const STATUS_MAP = {
  pending:    { label: 'Bekliyor',     cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Hazırlanıyor', cls: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Tamamlandı',   cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'İptal',        cls: 'bg-red-100 text-red-600' },
}

function getWeeklyData(orders, weekOffset = 0) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i - weekOffset * 7)
    days.push({
      label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
      sublabel: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      date: d.toISOString().split('T')[0],
      gelir: 0, siparis: 0,
    })
  }
  orders.forEach(o => {
    const date = new Date(o.created_at).toISOString().split('T')[0]
    const day = days.find(d => d.date === date)
    if (day) {
      day.siparis += 1
      if (o.status === 'completed') day.gelir += Number(o.final_price || o.total_price || 0)
    }
  })
  return days
}

function getMonthlyData(orders, monthOffset = 0) {
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i - monthOffset * 12)
    months.push({
      label: d.toLocaleDateString('tr-TR', { month: 'short' }),
      sublabel: d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      gelir: 0, siparis: 0,
    })
  }
  orders.forEach(o => {
    const d = new Date(o.created_at)
    const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth())
    if (m) {
      m.siparis += 1
      if (o.status === 'completed') m.gelir += Number(o.final_price || o.total_price || 0)
    }
  })
  return months
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const sub = payload[0]?.payload?.sublabel
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{sub || label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill }} className="font-medium">
          {p.name === 'gelir' ? `₺${Number(p.value).toFixed(2)}` : `${p.value} sipariş`}
        </p>
      ))}
      <p className="text-[10px] text-gray-400 mt-1">Tıkla detay gör</p>
    </div>
  )
}

function DayOrdersModal({ day, orders, mode, onClose }) {
  const dayOrders = orders.filter(o => {
    const d = new Date(o.created_at)
    if (mode === 'monthly') return d.getFullYear() === day.year && d.getMonth() === day.month
    return d.toISOString().split('T')[0] === day.date
  })

  const totalGelir = dayOrders.filter(o => o.status === 'completed')
    .reduce((s, o) => s + Number(o.final_price || o.total_price || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">{day.sublabel || day.label} Siparişleri</h3>
            <p className="text-xs text-gray-400 mt-0.5">{dayOrders.length} sipariş</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {dayOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Bu dönemde sipariş yok</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {dayOrders.map(o => {
                const s = STATUS_MAP[o.status] || STATUS_MAP.pending
                return (
                  <div key={o.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">#{o.id}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{o.profiles?.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                      <span className="font-bold text-blue-700 text-sm">₺{Number(o.final_price || o.total_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {dayOrders.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between text-sm">
            <span className="text-gray-500">Tamamlanan Gelir</span>
            <span className="font-bold text-blue-700">₺{totalGelir.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(EMPTY)
  const [allOrders, setAllOrders] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [chartMode, setChartMode] = useState('gelir')         // gelir | siparis
  const [viewMode, setViewMode] = useState('weekly')          // weekly | monthly
  const [offset, setOffset] = useState(0)                     // hafta/ay offset
  const [selectedDay, setSelectedDay] = useState(null)
  const [activeBar, setActiveBar] = useState(null)

  const fetchStats = async (force = false) => {
    if (force) setRefreshing(true)
    const orders = await cached('dashboard_orders', async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, status, final_price, total_price, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
      return data || []
    }, force ? 0 : 30000)

    const [{ count: customers }, { count: products }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
    ])

    const revenue = orders.filter(o => o.status === 'completed')
      .reduce((s, o) => s + (Number(o.final_price) || Number(o.total_price) || 0), 0)

    setStats({
      orders: orders.length, customers: customers || 0, products: products || 0, revenue,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    })
    setAllOrders(orders)
    setRecentOrders(orders.slice(0, 6))
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchStats() }, [])

  // offset veya viewMode değişince grafiği güncelle
  useEffect(() => {
    if (allOrders.length === 0) return
    if (viewMode === 'weekly') setChartData(getWeeklyData(allOrders, offset))
    else setChartData(getMonthlyData(allOrders, offset))
    setActiveBar(null)
  }, [allOrders, viewMode, offset])

  const handleBarClick = (data) => {
    if (!data?.activeLabel) return
    const day = chartData.find(d => d.label === data.activeLabel)
    if (day) { setSelectedDay(day); setActiveBar(data.activeLabel) }
  }

  // Dönem başlığı
  const periodLabel = () => {
    if (viewMode === 'weekly') {
      if (offset === 0) return 'Bu Hafta'
      if (offset === 1) return 'Geçen Hafta'
      return `${offset} Hafta Önce`
    } else {
      if (offset === 0) return 'Bu Yıl'
      return `${offset} Yıl Önce`
    }
  }

  const cards = [
    { label: 'Toplam Sipariş', value: stats.orders,                    icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Müşteriler',     value: stats.customers,                 icon: Users,       color: 'bg-indigo-500' },
    { label: 'Ürünler',        value: stats.products,                  icon: Package,     color: 'bg-purple-500' },
    { label: 'Toplam Gelir',   value: `₺${stats.revenue.toFixed(2)}`,  icon: TrendingUp,  color: 'bg-green-500' },
  ]
  const statusCards = [
    { label: 'Bekleyen',   value: stats.pending,    icon: Clock,       cls: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
    { label: 'Hazırlanan', value: stats.processing, icon: Truck,       cls: 'border-blue-200 bg-blue-50 text-blue-700' },
    { label: 'Tamamlanan', value: stats.completed,  icon: CheckCircle, cls: 'border-green-200 bg-green-50 text-green-700' },
    { label: 'İptal',      value: stats.cancelled,  icon: XCircle,     cls: 'border-red-200 bg-red-50 text-red-600' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {selectedDay && (
        <DayOrdersModal day={selectedDay} orders={allOrders} mode={viewMode} onClose={() => { setSelectedDay(null); setActiveBar(null) }} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <button onClick={() => fetchStats(true)} disabled={refreshing}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-blue-600 transition px-3 py-1.5 rounded-lg hover:bg-blue-50">
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Yenile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-xl`}><Icon size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statusCards.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${cls}`}>
            <Icon size={18} />
            <div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs opacity-75">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Haftalık / Aylık toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => { setViewMode('weekly'); setOffset(0) }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${viewMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                Haftalık
              </button>
              <button onClick={() => { setViewMode('monthly'); setOffset(0) }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                Aylık
              </button>
            </div>

            {/* Dönem navigasyonu */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setOffset(o => o + 1)}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-blue-600 transition">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-gray-600 px-2 min-w-[80px] text-center">{periodLabel()}</span>
              <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-blue-600 transition disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Gelir / Sipariş toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setChartMode('gelir')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${chartMode === 'gelir' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
              Gelir
            </button>
            <button onClick={() => setChartMode('siparis')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${chartMode === 'siparis' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
              Sipariş
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={viewMode === 'monthly' ? 20 : 32} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => chartMode === 'gelir' ? `₺${v}` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={chartMode} radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.date || entry.month}
                  fill={entry.label === activeBar
                    ? (chartMode === 'gelir' ? '#1d4ed8' : '#7c3aed')
                    : (chartMode === 'gelir' ? '#2563eb' : '#8b5cf6')}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Son siparişler */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Son Siparişler</h3>
          <span className="text-xs text-gray-400">{recentOrders.length} kayıt</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.map(o => {
            const s = STATUS_MAP[o.status] || STATUS_MAP.pending
            return (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">#{o.id}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{o.profiles?.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  <span className="font-bold text-blue-700 text-sm w-24 text-right">₺{Number(o.final_price || o.total_price || 0).toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}