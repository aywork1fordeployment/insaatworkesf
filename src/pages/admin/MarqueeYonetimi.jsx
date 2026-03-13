import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Pencil, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react'

const emptyForm = { text: '', sort_order: 0, is_active: true }

function ConfirmModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Yazıyı Sil</h3>
          <p className="text-sm text-gray-500">Bu metin silinecek. Geri alınamaz.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Vazgeç</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Evet, Sil</button>
        </div>
      </div>
    </div>
  )
}

function MarqueeForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Metin (HTML Destekli)</label>
          <input value={form.text} onChange={f('text')} placeholder="Örn: Orijinal & Güvenilir Ürünler"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Özel renk için: &lt;span class="text-sky-400"&gt;Kelime&lt;/span&gt; kullanabilirsiniz.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Sıra</label>
          <input type="number" value={form.sort_order} onChange={f('sort_order')} placeholder="0"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex items-end">
          <button type="button"
            onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              form.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
            {form.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
            {form.is_active ? 'Aktif' : 'Pasif'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave(form)} disabled={saving || !form.text}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5">
          {saving ? 'Kaydediliyor...' : <><Check size={14} />Kaydet</>}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
      </div>
    </div>
  )
}

export default function MarqueeYonetimi() {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editInitial, setEditInitial] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('marquee_items').select('*').order('sort_order')
    setItems(data || [])
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async (form) => {
    setSaving(true)
    await supabase.from('marquee_items').insert({
      text: form.text,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    })
    setSaving(false)
    setShowForm(false)
    fetch()
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    await supabase.from('marquee_items').update({
      text: form.text,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    }).eq('id', editId)
    setSaving(false)
    setEditId(null)
    setEditInitial(null)
    fetch()
  }

  const handleDelete = async () => {
    await supabase.from('marquee_items').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    fetch()
  }

  const toggleActive = async (item) => {
    await supabase.from('marquee_items').update({ is_active: !item.is_active }).eq('id', item.id)
    fetch()
  }

  return (
    <div>
      {deleteTarget && <ConfirmModal onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kayan Yazı Yönetimi</h2>
          <p className="text-sm text-gray-400 mt-0.5">Navbar'ın en üstündeki şerit duyurularını düzenle</p>
        </div>
        {!showForm && !editId && (
          <button onClick={() => { setShowForm(true); setEditId(null) }}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-700 transition font-semibold">
            <Plus size={15} /> Metin Ekle
          </button>
        )}
      </div>

      {showForm && <MarqueeForm initial={emptyForm} onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} />}

      <div className="flex flex-col gap-3">
        {items.length === 0 && !showForm && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-2 text-gray-400">
            <p className="text-sm font-medium">Henüz bir metin yok</p>
          </div>
        )}

        {items.map((item, i) => (
          <div key={item.id}>
            {editId === item.id ? (
              <MarqueeForm initial={editInitial} onSave={handleUpdate} onCancel={() => { setEditId(null); setEditInitial(null) }} saving={saving} />
            ) : (
              <div className={`bg-white rounded-xl border transition ${item.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                <div className="flex items-center gap-3 p-4">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {item.sort_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate" dangerouslySetInnerHTML={{ __html: item.text }} />
                  </div>
                  <button onClick={() => toggleActive(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex-shrink-0 ${
                      item.is_active ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {item.is_active ? <><Eye size={12} /> Aktif</> : <><EyeOff size={12} /> Pasif</>}
                  </button>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => { setEditId(item.id); setEditInitial({ ...item }); setShowForm(false) }}
                      className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(item.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}