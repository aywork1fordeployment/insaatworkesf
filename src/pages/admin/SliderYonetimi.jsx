import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Pencil, X, GripVertical, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react'

const emptyForm = { title: '', highlight: '', description: '', badge: '', sort_order: 0, is_active: true }

function ConfirmModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Slide'ı Sil</h3>
          <p className="text-sm text-gray-500">Bu slide silinecek. Geri alınamaz.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Vazgeç</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Evet, Sil</button>
        </div>
      </div>
    </div>
  )
}

function SlideForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Başlık</label>
          <input value={form.title} onChange={f('title')} placeholder="Permolit Boya"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Beyaz renkte gösterilir</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Vurgu Metin</label>
          <input value={form.highlight} onChange={f('highlight')} placeholder="Doğu Anadolu Bayii"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Mavi renkte gösterilir</p>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Açıklama</label>
          <textarea value={form.description} onChange={f('description')}
            placeholder="Slide açıklaması..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Badge Yazısı</label>
          <input value={form.badge} onChange={f('badge')} placeholder="Orijinal & Güvenilir"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Sol üstteki küçük etiket</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Sıra</label>
          <input type="number" value={form.sort_order} onChange={f('sort_order')} placeholder="0"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Küçük sayı = öne çıkar</p>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="button"
            onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              form.is_active
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
            {form.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
            {form.is_active ? 'Aktif — sitede görünüyor' : 'Pasif — sitede görünmüyor'}
          </button>
        </div>
      </div>

      {/* Önizleme */}
      <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6">
        <p className="text-[9px] text-blue-400/60 uppercase tracking-widest mb-3 font-bold">Önizleme</p>
        {form.badge && (
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-widest">
            ⚡ {form.badge}
          </div>
        )}
        <div className="text-2xl font-black leading-tight">
          <span className="text-white">{form.title || 'Başlık'}</span>
          <br />
          <span className="text-blue-400">{form.highlight || 'Vurgu Metin'}</span>
        </div>
        {form.description && (
          <p className="text-blue-200/60 text-xs mt-2 max-w-sm leading-relaxed">{form.description}</p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.highlight}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5">
          {saving ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Kaydediliyor...</> : <><Check size={14} />Kaydet</>}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
      </div>
    </div>
  )
}

export default function SliderYonetimi() {
  const [slides, setSlides] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editInitial, setEditInitial] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('slides').select('*').order('sort_order')
    setSlides(data || [])
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async (form) => {
    setSaving(true)
    await supabase.from('slides').insert({
      title: form.title,
      highlight: form.highlight,
      description: form.description,
      badge: form.badge,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    })
    setSaving(false)
    setShowForm(false)
    fetch()
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    await supabase.from('slides').update({
      title: form.title,
      highlight: form.highlight,
      description: form.description,
      badge: form.badge,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    }).eq('id', editId)
    setSaving(false)
    setEditId(null)
    setEditInitial(null)
    fetch()
  }

  const handleDelete = async () => {
    await supabase.from('slides').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    fetch()
  }

  const toggleActive = async (slide) => {
    await supabase.from('slides').update({ is_active: !slide.is_active }).eq('id', slide.id)
    fetch()
  }

  const startEdit = (slide) => {
    setEditId(slide.id)
    setEditInitial({ ...slide })
    setShowForm(false)
  }

  return (
    <div>
      {deleteTarget && <ConfirmModal onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Slider Yönetimi</h2>
          <p className="text-sm text-gray-400 mt-0.5">Ana sayfadaki slaytları buradan düzenle</p>
        </div>
        {!showForm && !editId && (
          <button onClick={() => { setShowForm(true); setEditId(null) }}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-700 transition font-semibold">
            <Plus size={15} /> Slide Ekle
          </button>
        )}
      </div>

      {/* Ekleme formu */}
      {showForm && (
        <SlideForm
          initial={emptyForm}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {/* Slide listesi */}
      <div className="flex flex-col gap-3">
        {slides.length === 0 && !showForm && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-2 text-gray-400">
            <p className="text-sm font-medium">Henüz slide yok</p>
            <p className="text-xs">Yukarıdan ekleyebilirsin</p>
          </div>
        )}

        {slides.map((slide, i) => (
          <div key={slide.id}>
            {/* Düzenleme formu — inline */}
            {editId === slide.id ? (
              <SlideForm
                initial={editInitial}
                onSave={handleUpdate}
                onCancel={() => { setEditId(null); setEditInitial(null) }}
                saving={saving}
              />
            ) : (
              <div className={`bg-white rounded-xl border transition ${slide.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                <div className="flex items-center gap-3 p-4">
                  {/* Sıra numarası */}
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {i + 1}
                  </div>

                  {/* Mini önizleme */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm truncate">{slide.title}</p>
                      <span className="text-blue-500 font-bold text-sm truncate">{slide.highlight}</span>
                      {slide.badge && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-semibold">
                          {slide.badge}
                        </span>
                      )}
                    </div>
                    {slide.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs sm:max-w-sm">{slide.description}</p>
                    )}
                  </div>

                  {/* Aktif toggle */}
                  <button onClick={() => toggleActive(slide)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex-shrink-0 ${
                      slide.is_active
                        ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {slide.is_active ? <><Eye size={12} /> Aktif</> : <><EyeOff size={12} /> Pasif</>}
                  </button>

                  {/* Aksiyon butonları */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => startEdit(slide)}
                      className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(slide.id)}
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