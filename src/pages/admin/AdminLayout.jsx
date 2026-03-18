import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { supabase } from '../../lib/supabase'


import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, ScrollText, Menu, X, Bell, Tag, Monitor, Type } from 'lucide-react'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/admin/siparisler',    label: 'Siparişler', icon: ShoppingBag, badge: true },
  { to: '/admin/urunler',  label: 'Ürünler',    icon: Package },
  { to: '/admin/kategoriler',label: 'Kategoriler',icon: Tag },
  { to: '/admin/musteriler', label: 'Müşteriler', icon: Users },
  { to: '/admin/kayitlar',      label: 'Loglar',     icon: ScrollText },
  { to: '/admin/slider', label: 'Slider Yönetimi', icon: Monitor },
  { to: '/admin/marquee', label: 'Kayan Yazı', icon: Type }

]
const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/'
}

export default function AdminLayout() {
  const { profile } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newOrders, setNewOrders] = useState(0)
  const [toasts, setToasts] = useState([])

useEffect(() => {
  const lastSeen = localStorage.getItem('admin_orders_last_seen')
  
  // Son görülmeden sonraki pending siparişleri say
  let query = supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  if (lastSeen) query = query.gt('created_at', lastSeen)
  
  query.then(({ count }) => setNewOrders(count || 0))

  const channel = supabase.channel('admin-orders')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'orders'
    }, (payload) => {
      setNewOrders(prev => prev + 1)
      const id = Date.now()
      setToasts(prev => [...prev, { id, name: payload.new?.customer_note || 'Yeni sipariş' }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])

  // Siparişler sayfasına girince sıfırla
useEffect(() => {
  if (location.pathname === '/admin/siparisler') {
    localStorage.setItem('admin_orders_last_seen', new Date().toISOString())
    setNewOrders(0)
  }
}, [location.pathname])

  const currentLabel = navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Sayfa'

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Toast bildirimleri */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id}
            className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">Yeni Sipariş!</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{toast.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobil overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-60 bg-slate-900 text-white flex flex-col shadow-xl
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="ESF Yapı İnşaat - Permolit Boya Bayii logo"
                className="w-9 h-9 rounded-xl shadow object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
              <div className="hidden items-center justify-center w-9 h-9 bg-blue-700 rounded-xl shadow">
                <span className="text-white font-black text-base">E</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">ESF YAPI İNŞAAT</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
              }
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge && newOrders > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {newOrders > 9 ? '9+' : newOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/60">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 font-bold text-xs">
              {(profile?.full_name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500">Yönetici</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <Menu size={20} />
            </button>
            <div>
              <span className="text-xs text-gray-400">Panel / </span>
              <span className="text-xs text-gray-600 font-semibold">{currentLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {newOrders > 0 && (
              <NavLink to="/admin/siparisler"
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-100 transition">
                <Bell size={13} className="animate-bounce" />
                {newOrders} yeni sipariş
              </NavLink>
            )}
            <div className="text-xs text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700/60 z-30">
          <div className="flex">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all relative
                  ${isActive ? 'text-blue-400' : 'text-slate-500'}`
                }
              >
                <Icon size={18} />
                {badge && newOrders > 0 && (
                  <span className="absolute top-1.5 right-1/4 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {newOrders > 9 ? '9+' : newOrders}
                  </span>
                )}
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}