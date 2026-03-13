import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, optimizeUrl } from '../../lib/cloudinary'
import {
  Plus, Trash2, Pencil, X, Upload, AlertTriangle, Search,
  ChevronDown, Check, Copy, ArrowUpDown, AlertCircle, PackagePlus, Layers,
  Tag, Percent
} from 'lucide-react'

const emptyForm = { name: '', price: '', stock: '', base_label: '', description: '', category: 'Diğer', image_url: '' }
const emptyVariant = { label: '', price: '', stock: '' }

const writeProductLog = async (action, note) => {
  await supabase.from('order_logs').insert({ order_id: null, action, note })
}

// İndirimli fiyat hesapla
const calcDiscounted = (price, rate) => Number(price) * (1 - Number(rate) / 100)

// Bugünkü aktif indirim
const getActiveDiscount = (discounts, productId) => {
  const now = new Date()
  return discounts.find(d =>
    d.product_id === productId &&
    d.is_active &&
    new Date(d.start_date) <= now &&
    new Date(d.end_date) >= now
  ) || null
}

// ─── Confirm Modal ───────────────────────────────────────────────────────────
function ConfirmModal({ name, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Ürünü Sil</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">"{name}"</span> silinecek. Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Vazgeç</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Evet, Sil</button>
        </div>
      </div>
    </div>
  )
}

// ─── Discount Modal ──────────────────────────────────────────────────────────
function DiscountModal({ product, existingDiscount, onClose, onSave }) {
  const [rate, setRate] = useState(existingDiscount?.rate ?? '')
  const [startDate, setStartDate] = useState(
    existingDiscount?.start_date ? existingDiscount.start_date.slice(0, 16) : new Date().toISOString().slice(0, 16)
  )
  const [endDate, setEndDate] = useState(
    existingDiscount?.end_date ? existingDiscount.end_date.slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)

  const discountedPrice = rate ? calcDiscounted(product.price, rate) : null

  const handleSave = async () => {
    if (!rate || !endDate) return
    setSaving(true)
    if (existingDiscount) {
      await supabase.from('discounts').update({
        rate: parseFloat(rate),
        start_date: startDate,
        end_date: endDate,
        is_active: true,
      }).eq('id', existingDiscount.id)
    } else {
      await supabase.from('discounts').insert({
        product_id: product.id,
        rate: parseFloat(rate),
        start_date: startDate,
        end_date: endDate,
        is_active: true,
      })
    }
    await writeProductLog('indirim_eklendi', `"${product.name}" için %${rate} indirim tanımlandı`)
    setSaving(false)
    onSave()
    onClose()
  }

  const handleRemove = async () => {
    if (!existingDiscount) return
    setSaving(true)
    await supabase.from('discounts').update({ is_active: false }).eq('id', existingDiscount.id)
    await writeProductLog('indirim_kaldirildi', `"${product.name}" indirimi kaldırıldı`)
    setSaving(false)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Tag size={16} className="text-blue-600" /> İndirim Tanımla
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {/* Ürün özeti */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image_url
              ? <img src={optimizeUrl(product.image_url, 80)} alt="" className="w-full h-full object-cover" />
              : <span className="text-lg">🪣</span>}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
            <p className="text-blue-700 font-bold text-sm">₺{Number(product.price).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {/* İndirim oranı */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
              İndirim Oranı (%)
            </label>
            <div className="relative">
              <input
                type="number" min="1" max="99" value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="örn: 20"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8" />
              <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {/* Canlı önizleme */}
            {discountedPrice !== null && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-400 line-through">₺{Number(product.price).toFixed(2)}</span>
                <span className="text-sm font-black text-green-700">₺{discountedPrice.toFixed(2)}</span>
                <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  %{rate} indirim
                </span>
              </div>
            )}
          </div>

          {/* Başlangıç tarihi */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Başlangıç</label>
            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Bitiş tarihi */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Bitiş</label>
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-2">
          {existingDiscount && (
            <button onClick={handleRemove} disabled={saving}
              className="py-2.5 px-4 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50">
              Kaldır
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
            İptal
          </button>
          <button onClick={handleSave} disabled={saving || !rate || !endDate}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : existingDiscount ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Bulk Stock Modal ────────────────────────────────────────────────────────
function BulkStockModal({ selected, products, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('add')
  const [saving, setSaving] = useState(false)
  const selectedProducts = products.filter(p => selected.includes(p.id))

  const handleSave = async () => {
    if (!amount) return
    setSaving(true)
    for (const p of selectedProducts) {
      const newStock = mode === 'add' ? p.stock + parseInt(amount) : parseInt(amount)
      await supabase.from('products').update({ stock: newStock }).eq('id', p.id)
      await writeProductLog('stok_guncellendi', `"${p.name}" stok: ${p.stock} → ${newStock}`)
    }
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Toplu Stok Güncelle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-blue-600 font-semibold mb-1">{selectedProducts.length} ürün seçili:</p>
          <div className="flex flex-wrap gap-1">
            {selectedProducts.map(p => (
              <span key={p.id} className="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-lg border border-blue-100">
                {p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name} ({p.stock})
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button onClick={() => setMode('add')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Stok Ekle / Çıkar</button>
          <button onClick={() => setMode('set')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode === 'set' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Sabit Değer</button>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
            {mode === 'add' ? 'Miktar (negatif için - kullan)' : 'Yeni Stok Değeri'}
          </label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder={mode === 'add' ? 'örn: 10 veya -5' : 'örn: 50'}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">İptal</button>
          <button onClick={handleSave} disabled={saving || !amount}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Category Dropdown ───────────────────────────────────────────────────────
function CategoryDropdown({ cats, activeCat, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const options = ['Tümü', ...cats]
  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition">
        <span className="truncate pr-1 text-xs sm:text-sm">{activeCat === 'Tümü' ? 'Kategori' : activeCat}</span>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {options.map(cat => (
            <button key={cat} onClick={() => { onChange(cat); setOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${activeCat === cat ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {cat === 'Tümü' ? 'Tüm Kategoriler' : cat}
              {activeCat === cat && <Check size={13} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sort Dropdown ───────────────────────────────────────────────────────────
function SortDropdown({ sort, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const options = [
    { value: 'newest', label: 'En Yeni' }, { value: 'oldest', label: 'En Eski' },
    { value: 'price_asc', label: 'Fiyat ↑' }, { value: 'price_desc', label: 'Fiyat ↓' },
    { value: 'stock_asc', label: 'Stok ↑' }, { value: 'stock_desc', label: 'Stok ↓' },
    { value: 'name_asc', label: 'A → Z' }, { value: 'name_desc', label: 'Z → A' },
  ]
  const current = options.find(o => o.value === sort)
  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition">
        <div className="flex items-center gap-1.5 truncate">
          <ArrowUpDown size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">{current?.label || 'Sırala'}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${sort === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {opt.label}
              {sort === opt.value && <Check size={13} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Image Input ─────────────────────────────────────────────────────────────
function ImageInput({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState('url')
  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try { const url = await uploadImage(file); onChange(url) }
    catch (err) { alert('Görsel yüklenemedi: ' + err.message) }
    setUploading(false)
  }
  return (
    <div className="col-span-1 sm:col-span-2">
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Görsel</label>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setMode('url')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>URL ile</button>
        <button type="button" onClick={() => setMode('upload')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Dosya Yükle</button>
      </div>
      {mode === 'url' ? (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      ) : (
        <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-3 py-4 cursor-pointer transition ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          {uploading
            ? <span className="text-sm text-blue-500 font-medium flex items-center gap-2"><span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />Yükleniyor...</span>
            : <span className="text-sm text-gray-400 flex items-center gap-2"><Upload size={16} /> Görsel seç veya sürükle</span>}
        </label>
      )}
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <img src={optimizeUrl(value, 80)} alt="önizleme" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
          <span className="text-xs text-green-600 font-medium">Görsel hazır</span>
          <button type="button" onClick={() => onChange('')} className="ml-auto text-xs text-red-400 hover:text-red-600">Kaldır</button>
        </div>
      )}
    </div>
  )
}

// ─── Variant Editor ──────────────────────────────────────────────────────────
function VariantEditor({ variants, onChange }) {
  const add = () => onChange([...variants, { ...emptyVariant, _key: Date.now() }])
  const remove = (i) => onChange(variants.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...variants]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  return (
    <div className="col-span-1 sm:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Layers size={12} /> Ek Varyantlar
          <span className="text-gray-400 font-normal normal-case tracking-normal">(isteğe bağlı)</span>
        </label>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1.5 rounded-lg font-semibold transition">
          <Plus size={11} /> Varyant Ekle
        </button>
      </div>
      {variants.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Ek varyant yok — yukarıdaki seçenek etiketi zaten bir seçenek olarak görünür.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Seçenek</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Fiyat (₺)</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Stok</span>
            <span />
          </div>
          {variants.map((v, i) => (
            <div key={v.id || v._key || i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-gray-50 rounded-xl px-3 py-2">
              <input type="text" value={v.label} onChange={e => update(i, 'label', e.target.value)} placeholder="örn: 2.5L"
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              <input type="number" value={v.price} onChange={e => update(i, 'price', e.target.value)} placeholder="0.00"
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              <input type="number" value={v.stock} onChange={e => update(i, 'stock', e.target.value)} placeholder="0"
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              <button type="button" onClick={() => remove(i)}
                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Ortak Form Alanları ─────────────────────────────────────────────────────
function ProductFormFields({ form, setForm, cats, imageKey }) {
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Ürün Adı</label>
        <input type="text" value={form.name} onChange={f('name')}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
          Seçenek Etiketi <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(zorunlu değil)</span>
        </label>
        <input type="text" value={form.base_label} onChange={f('base_label')} placeholder="örn: 750ml, 1L, Standart"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p className="text-[10px] text-gray-400 mt-1">Ürün detayında seçenek butonu olarak görünür</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Fiyat (₺)</label>
        <input type="number" value={form.price} onChange={f('price')}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Stok Adedi</label>
        <input type="number" value={form.stock} onChange={f('stock')}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Açıklama</label>
        <input type="text" value={form.description} onChange={f('description')}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Kategori</label>
        <select value={form.category} onChange={f('category')}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <ImageInput key={imageKey} value={form.image_url} onChange={url => setForm(prev => ({ ...prev, image_url: url }))} />
    </>
  )
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function Products() {
  const [products, setProducts] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [formVariants, setFormVariants] = useState([])
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editVariants, setEditVariants] = useState([])
  const [cats, setCats] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [discountTarget, setDiscountTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Tümü')
  const [sort, setSort] = useState('newest')
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [selected, setSelected] = useState([])
  const [showBulkStock, setShowBulkStock] = useState(false)

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  const fetchDiscounts = async () => {
    const { data } = await supabase.from('discounts').select('*').eq('is_active', true)
    setDiscounts(data || [])
  }

  useEffect(() => {
    fetchProducts()
    fetchDiscounts()
    supabase.from('categories').select('name').order('name')
      .then(({ data }) => setCats(data?.map(c => c.name) || []))
  }, [])

  const criticalCount = products.filter(p => p.stock <= 5).length

  const sortFn = (a, b) => {
    switch (sort) {
      case 'oldest': return new Date(a.created_at) - new Date(b.created_at)
      case 'price_asc': return a.price - b.price
      case 'price_desc': return b.price - a.price
      case 'stock_asc': return a.stock - b.stock
      case 'stock_desc': return b.stock - a.stock
      case 'name_asc': return a.name.localeCompare(b.name, 'tr')
      case 'name_desc': return b.name.localeCompare(a.name, 'tr')
      default: return new Date(b.created_at) - new Date(a.created_at)
    }
  }

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCat === 'Tümü' || p.category === activeCat
      const matchCritical = !showCriticalOnly || p.stock <= 5
      return matchSearch && matchCat && matchCritical
    })
    .sort(sortFn)

  const saveVariants = async (productId, variants, existingVariants = []) => {
    const existingIds = existingVariants.map(v => v.id)
    const keepIds = variants.filter(v => v.id).map(v => v.id)
    const deleteIds = existingIds.filter(id => !keepIds.includes(id))
    if (deleteIds.length > 0) await supabase.from('product_variants').delete().in('id', deleteIds)
    for (const v of variants) {
      if (!v.label || v.price === '' || v.stock === '') continue
      if (v.id) {
        await supabase.from('product_variants').update({ label: v.label, price: parseFloat(v.price), stock: parseInt(v.stock) }).eq('id', v.id)
      } else {
        await supabase.from('product_variants').insert({ product_id: productId, label: v.label, price: parseFloat(v.price), stock: parseInt(v.stock) })
      }
    }
  }

  const handleAdd = async () => {
    setAdding(true)
    try {
      const { data, error } = await supabase.from('products').insert({
        name: form.name, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0,
        base_label: form.base_label || null, description: form.description,
        category: form.category, image_url: form.image_url || null
      }).select().single()
      if (error) throw error
      if (formVariants.length > 0) await saveVariants(data.id, formVariants)
      await supabase.from('order_logs').insert({
        order_id: null, action: 'urun_eklendi',
        note: `"${data.name}" eklendi — ₺${data.price}, Stok: ${data.stock}`
      })
      setForm(emptyForm); setFormVariants([]); setShowForm(false); setAdding(false)
      await fetchProducts()
    } catch (err) { console.error('Hata:', err); setAdding(false) }
  }

  const startEdit = async (p) => {
    setEditId(p.id)
    setEditForm({ name: p.name, price: p.price, stock: p.stock, base_label: p.base_label || '', description: p.description || '', category: p.category || 'Diğer', image_url: p.image_url || '' })
    const { data } = await supabase.from('product_variants').select('*').eq('product_id', p.id).order('price')
    setEditVariants(data || [])
  }

  const handleUpdate = async (id) => {
    const prev = products.find(p => p.id === id)
    await supabase.from('products').update({
      name: editForm.name, price: parseFloat(editForm.price), stock: parseInt(editForm.stock),
      base_label: editForm.base_label || null, description: editForm.description,
      category: editForm.category, image_url: editForm.image_url || null
    }).eq('id', id)
    const { data: existingVars } = await supabase.from('product_variants').select('*').eq('product_id', id)
    await saveVariants(id, editVariants, existingVars || [])
    const changes = []
    if (prev.price != editForm.price) changes.push(`Fiyat: ₺${prev.price} → ₺${editForm.price}`)
    if (prev.stock != editForm.stock) changes.push(`Stok: ${prev.stock} → ${editForm.stock}`)
    if (prev.name != editForm.name) changes.push(`Ad: "${prev.name}" → "${editForm.name}"`)
    await writeProductLog('urun_guncellendi', `"${editForm.name}" güncellendi${changes.length ? ` — ${changes.join(', ')}` : ''}`)
    setEditId(null); setEditVariants([]); await fetchProducts()
  }

  const handleDelete = async () => {
    const p = deleteTarget
    await supabase.from('product_variants').delete().eq('product_id', p.id)
    await supabase.from('products').delete().eq('id', p.id)
    await writeProductLog('urun_silindi', `"${p.name}" silindi — ₺${p.price}`)
    setProducts(prev => prev.filter(x => x.id !== p.id))
    setDeleteTarget(null)
  }

  const handleDuplicate = async (p) => {
    const { data, error } = await supabase.from('products').insert({
      name: `${p.name} (Kopya)`, price: p.price, stock: p.stock, base_label: p.base_label,
      description: p.description, category: p.category, image_url: p.image_url
    }).select().single()
    if (!error) {
      const { data: vars } = await supabase.from('product_variants').select('*').eq('product_id', p.id)
      if (vars && vars.length > 0) {
        await supabase.from('product_variants').insert(vars.map(v => ({ product_id: data.id, label: v.label, price: v.price, stock: v.stock })))
      }
      await writeProductLog('urun_kopyalandi', `"${p.name}" kopyalandı`)
      await fetchProducts()
    }
  }

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id))

  return (
    <div>
      {deleteTarget && <ConfirmModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {showBulkStock && <BulkStockModal selected={selected} products={products} onClose={() => setShowBulkStock(false)} onSave={() => { setSelected([]); fetchProducts() }} />}
      {discountTarget && (
        <DiscountModal
          product={discountTarget}
          existingDiscount={getActiveDiscount(discounts, discountTarget.id)}
          onClose={() => setDiscountTarget(null)}
          onSave={() => { fetchDiscounts(); fetchProducts() }}
        />
      )}

      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Ürünler <span className="text-gray-400 font-normal text-sm ml-1">({filtered.length})</span>
        </h2>
        <button onClick={() => { setShowForm(true); setForm(emptyForm); setFormVariants([]) }}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-700 transition font-semibold">
          <Plus size={15} /> <span className="hidden sm:inline">Ürün Ekle</span><span className="sm:hidden">Ekle</span>
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ürün adı veya açıklamasında ara..."
            className="w-full h-10 pl-10 pr-9 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2">
          <CategoryDropdown cats={cats} activeCat={activeCat} onChange={setActiveCat} />
          <SortDropdown sort={sort} onChange={setSort} />
          <button onClick={() => setShowCriticalOnly(v => !v)}
            className={`flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold border transition flex-shrink-0 ${showCriticalOnly ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'}`}>
            <AlertCircle size={13} />
            <span className="hidden sm:inline">Kritik Stok</span>
            {criticalCount > 0 && (
              <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${showCriticalOnly ? 'bg-white text-red-500' : 'bg-red-500 text-white'}`}>
                {criticalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toplu seçim */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl mb-4">
          <span className="text-sm font-semibold flex-1">{selected.length} seçili</span>
          <button onClick={() => setShowBulkStock(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
            <PackagePlus size={13} /> Stok Güncelle
          </button>
          <button onClick={() => setSelected([])} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Ekleme Formu */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProductFormFields form={form} setForm={setForm} cats={cats} imageKey={showForm ? 'open' : 'closed'} />
          <VariantEditor variants={formVariants} onChange={setFormVariants} />
          <div className="col-span-1 sm:col-span-2 flex gap-2">
            <button onClick={handleAdd} disabled={adding}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50 font-semibold">
              {adding ? 'Ekleniyor...' : 'Kaydet'}
            </button>
            <button onClick={() => { setShowForm(false); setFormVariants([]) }}
              className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Ürünü Düzenle</h3>
              <button onClick={() => { setEditId(null); setEditVariants([]) }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProductFormFields form={editForm} setForm={setEditForm} cats={cats} imageKey={editId} />
              <VariantEditor variants={editVariants} onChange={setEditVariants} />
              <div className="col-span-1 sm:col-span-2 flex gap-2 mt-1">
                <button onClick={() => handleUpdate(editId)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition font-semibold">Güncelle</button>
                <button onClick={() => { setEditId(null); setEditVariants([]) }}
                  className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              checked={filtered.length > 0 && selected.length === filtered.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
            <h3 className="font-bold text-gray-800 text-sm">Ürün Listesi</h3>
          </div>
          <span className="text-xs text-gray-400">
            {filtered.length !== products.length ? `${filtered.length}/${products.length}` : `${products.length} ürün`}
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-2 text-gray-400">
              <Search size={28} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Sonuç bulunamadı</p>
            </div>
          ) : filtered.map(p => {
            const isSelected = selected.includes(p.id)
            const discount = getActiveDiscount(discounts, p.id)
            const discountedPrice = discount ? calcDiscounted(p.price, discount.rate) : null

            return (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0" />

                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-blue-50 flex items-center justify-center">
                  {p.image_url ? <img src={optimizeUrl(p.image_url, 80)} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-lg">🪣</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm truncate max-w-[130px] sm:max-w-none">{p.name}</p>
                    {p.base_label && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full flex-shrink-0">{p.base_label}</span>
                    )}
                    {discount && (
                      <span className="text-[10px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                        %{Number(discount.rate).toFixed(0)} İndirim
                      </span>
                    )}
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:inline">{p.category || '—'}</span>
                  </div>

                  {/* Fiyat: kaçtan kaça düştü */}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {discountedPrice !== null ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">₺{Number(p.price).toFixed(2)}</span>
                        <span className="font-bold text-green-600 text-sm">₺{discountedPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-blue-700 text-sm">₺{Number(p.price).toFixed(2)}</span>
                    )}
                    <span className={`text-xs flex-shrink-0 ${p.stock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                      {p.stock} adet {p.stock <= 5 && '⚠️'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => startEdit(p)} className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition" title="Düzenle">
                    <Pencil size={14} />
                  </button>
                  {/* İndirim butonu — aktifse yeşil */}
                  <button
                    onClick={() => setDiscountTarget(p)}
                    className={`p-1.5 rounded-lg transition hidden sm:flex ${discount ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                    title={discount ? 'İndirimi Düzenle' : 'İndirim Ekle'}>
                    <Tag size={14} />
                  </button>
                  <button onClick={() => handleDuplicate(p)} className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition hidden sm:flex" title="Kopyala">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition" title="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}