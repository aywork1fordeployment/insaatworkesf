import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { blocked } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    const wasBlocked = localStorage.getItem('esf-blocked')
    if (wasBlocked) {
      setError('Hesabınız engellenmiştir. Daha fazla bilgi için mağazayla iletişime geçin.')
      localStorage.removeItem('esf-blocked')
    }
  }, [])

  useEffect(() => {
    if (blocked) {
      setError('Hesabınız engellenmiştir. Daha fazla bilgi için mağazayla iletişime geçin.')
    }
  }, [blocked])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    useAuthStore.setState({ signingIn: true, blocked: false })

    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      useAuthStore.setState({ signingIn: false })
      setError('Email veya şifre hatalı.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles').select('role, is_blocked').eq('id', authData.user.id).maybeSingle()

   if (profile?.is_blocked) {
      await supabase.auth.signOut()
      localStorage.setItem('esf-blocked', '1')
      useAuthStore.setState({ signingIn: false, blocked: true })
      setError('Hesabınız engellenmiştir. Daha fazla bilgi için mağazayla iletişime geçin.')
      setLoading(false)
      return
    }

    useAuthStore.setState({
      signingIn: false,
      user: authData.user,
      profile: profile,
      loading: false,
      blocked: false,
    })
    setLoading(false)
    navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 shadow-lg">
            <img src="/logo.png" alt="ESF" className="w-10 h-10 object-contain rounded-xl"
              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
            <span className="hidden text-white font-black text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ESF Yapı & İnşaat</h1>
          <p className="text-blue-300 text-sm mt-1">Hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span className="text-red-400">⚠</span> {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="ornek@gmail.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Şifre</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-11"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><LogIn size={16} /> Giriş Yap</>
              }
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Hesabın yok mu?{' '}
              <Link to="/kayit-ol" className="text-blue-600 font-semibold hover:underline">Kayıt Ol</Link>
            </p>
          </div>

          <div className="mt-3 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
              Giriş yapmadan ürünlere göz at →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}