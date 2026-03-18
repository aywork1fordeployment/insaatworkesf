import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import UserOrders from './pages/UserOrders'
import Profile from './pages/Profile'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import Products from './pages/admin/Products'
import Customers from './pages/admin/Customers'
import Categories from './pages/admin/Categories'
import Logs from './pages/admin/Logs'
import About from './pages/About'
import Contact from './pages/Contact'
import SliderYonetimi from './pages/admin/SliderYonetimi'
import MarqueeYonetimi from './pages/admin/MarqueeYonetimi'


function PrivateRoute({ children }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/giris-yap" aria-label="Kullanıcı girişi"/>
  if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" />
  return children
}

function GuestRoute({ children }) {
  const { user, loading, blocked, signingIn } = useAuthStore()
  if (loading || signingIn) return <LoadingScreen />
  if (blocked) return children
  return !user ? children : <Navigate to="/" />
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/giris-yap" aria-label="Kullanıcı girişi"/>
  if (profile?.role !== 'admin') return <Navigate to="/" />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppContent() {
  
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/urun/:id" element={<ProductDetail />} />
        <Route path="/giris-yap" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/kayit-ol" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/sepetim" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/siparislerim" element={<PrivateRoute><UserOrders /></PrivateRoute>} />
        <Route path="/profilim" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/hakkimizda" element={<About />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="siparisler" element={<Orders />} />
          <Route path="urunler" element={<Products />} />
          <Route path="kayitlar" element={<Logs />} />
          <Route path="musteriler" element={<Customers />} />
          <Route path="kategoriler" element={<Categories />} />
          <Route path="slider" element={<SliderYonetimi />} />
          <Route path="marquee" element={<MarqueeYonetimi />} />
        </Route>
      </Routes>
      {!isAdmin && <Footer />}
    </>
  )
}

function App() {
  const { initialize, profile } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
export default App