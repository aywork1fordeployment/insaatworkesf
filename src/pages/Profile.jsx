import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import { User, Phone, Mail, Lock, Check, Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { profile, user } = useAuthStore()
  const [tab, setTab] = useState('info')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
  })

  const [passForm, setPassForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleSaveInfo = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone_number: form.phone_number })
      .eq('id', user.id)
    setSaving(false)
    if (error) showMsg('error', 'Kaydedilemedi.')
    else showMsg('success', 'Bilgiler güncellendi.')
  }

  const handleChangePassword = async () => {
    if (passForm.newPass !== passForm.confirm) {
      showMsg('error', 'Yeni şifreler eşleşmiyor.')
      return
    }
    if (passForm.newPass.length < 6) {
      showMsg('error', 'Şifre en az 6 karakter olmalı.')
      return
    }
    setSaving(true)

    // Önce mevcut şifreyle doğrula
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passForm.current,
    })
    if (signInError) {
      showMsg('error', 'Mevcut şifre hatalı.')
      setSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: passForm.newPass })
    setSaving(false)
    if (error) showMsg('error', 'Şifre değiştirilemedi.')
    else {
      showMsg('success', 'Şifre başarıyla değiştirildi.')
      setPassForm({ current: '', newPass: '', confirm: '' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
            {(profile?.full_name || 'K')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{profile?.full_name || 'Kullanıcı'}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
          <button onClick={() => setTab('info')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'info' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
            Bilgilerim
          </button>
          <button onClick={() => setTab('password')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'password' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
            Şifre Değiştir
          </button>
        </div>

        {/* Mesaj */}
        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium mb-5 flex items-center gap-2
            ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {msg.type === 'success' ? <Check size={15} /> : '⚠'} {msg.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {tab === 'info' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Ad Soyad</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Telefon</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={user?.email} disabled
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <button onClick={handleSaveInfo} disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 mt-1">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Mevcut Şifre</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showOld ? 'text' : 'password'} value={passForm.current}
                    onChange={e => setPassForm({...passForm, current: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Yeni Şifre</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showNew ? 'text' : 'password'} value={passForm.newPass}
                    onChange={e => setPassForm({...passForm, newPass: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="En az 6 karakter" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Yeni Şifre Tekrar</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={passForm.confirm}
                    onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="••••••••" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 mt-1">
                {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}