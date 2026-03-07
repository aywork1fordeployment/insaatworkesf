import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })

  const handlePhone = (val) => {
    // Sadece rakam al, +90 sonrasını
    const digits = val.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')
    setForm(f => ({ ...f, phone: digits.slice(0, 10) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.phone.length !== 10) {
      setError('Geçerli bir telefon numarası girin. (10 hane)')
      return
    }

    setLoading(true)
    const fullPhone = '+90' + form.phone

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone_number: fullPhone } }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      navigate('/login')
      return
    }

    navigate('/')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 shadow-lg">
            <img src="/logo.png" alt="ESF" className="w-10 h-10 object-contain rounded-xl"
              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
            <span className="hidden text-white font-black text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ESF YAPI İNŞAAT</h1>
          <p className="text-blue-300 text-sm mt-1">Yeni hesap oluşturun</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Ad Soyad</label>
              <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Ali Yılmaz" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="ornek@gmail.com" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Telefon</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
                <span className="bg-gray-50 border-r border-gray-200 px-3 py-3 text-sm font-semibold text-gray-500 select-none">+90</span>
                <input type="tel" value={form.phone} onChange={e => handlePhone(e.target.value)}
                  className="flex-1 px-3 py-3 text-sm focus:outline-none"
                  placeholder="5001234567" maxLength={10} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Başında 0 olmadan 10 hane girin</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Şifre</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-11"
                  placeholder="En az 6 karakter" minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={16} /> Kayıt Ol</>
              )}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Giriş Yap</Link>
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