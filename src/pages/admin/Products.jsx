import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, optimizeUrl } from '../../lib/cloudinary'
import { Plus, Trash2, Pencil, X, Upload, Image, AlertTriangle, Search, ChevronDown, Check, Copy, ArrowUpDown, AlertCircle, PackagePlus } from 'lucide-react'

const emptyForm = { name: '', price: '', stock: '', description: '', category: 'Diğer', image_url: '' }

const writeProductLog = async (action, note) => {
  await supabase.from('order_logs').insert({ order_id: null, action, note })
}

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

// Toplu stok güncelleme modalı
function BulkStockModal({ selected, products, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('add') // add | set
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
    setSaving(false)
    onSave()
    onClose()
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
          <button onClick={() => setMode('add')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
            Stok Ekle / Çıkar
          </button>
          <button onClick={() => setMode('set')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode === 'set' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
            Sabit Değer
          </button>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
            {mode === 'add' ? 'Miktar (negatif değer için - kullan)' : 'Yeni Stok Değeri'}
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
    <div className="relative w-[180px]" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full h-11 px-
        
        bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition">
        <span className="truncate pr-2">{activeCat === 'Tümü' ? 'Tüm Kategoriler' : activeCat}</span>
        <ChevronDown size={15} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-full min-w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {options.map(cat => (
            <button key={cat} onClick={() => { onChange(cat); setOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${activeCat === cat ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {cat === 'Tümü' ? 'Tüm Kategoriler' : cat}
              {activeCat === cat && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SortDropdown({ sort, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const options = [
    { value: 'newest',     label: 'En Yeni' },
    { value: 'oldest',     label: 'En Eski' },
    { value: 'price_asc',  label: 'Fiyat: Düşük → Yüksek' },
    { value: 'price_desc', label: 'Fiyat: Yüksek → Düşük' },
    { value: 'stock_asc',  label: 'Stok: Az → Çok' },
    { value: 'stock_desc', label: 'Stok: Çok → Az' },
    { value: 'name_asc',   label: 'İsim: A → Z' },
    { value: 'name_desc',  label: 'İsim: Z → A' },
  ]
  const current = options.find(o => o.value === sort)
  return (
    <div className="relative w-[160px]" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition">
        <div className="flex items-center gap-2 truncate">
          <ArrowUpDown size={13} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{current?.label || 'Sırala'}</span>
        </div>
        <ChevronDown size={15} className={`text-gray-400 flex-shrink-0 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-full min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${sort === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {opt.label}
              {sort === opt.value && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
    <div className="col-span-2">
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
          {uploading ? (
            <span className="text-sm text-blue-500 font-medium flex items-center gap-2"><span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />Yükleniyor...</span>
          ) : (
            <span className="text-sm text-gray-400 flex items-center gap-2"><Upload size={16} /> Görsel seç veya sürükle</span>
          )}
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

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [cats, setCats] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Tümü')
  const [sort, setSort] = useState('newest')
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [selected, setSelected] = useState([])      // toplu seçim
  const [showBulkStock, setShowBulkStock] = useState(false)

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  useEffect(() => {
    fetchProducts()
    supabase.from('categories').select('name').order('name')
      .then(({ data }) => setCats(data?.map(c => c.name) || []))
  }, [])

  const criticalCount = products.filter(p => p.stock <= 5).length

  const sortFn = (a, b) => {
    switch (sort) {
      case 'oldest':     return new Date(a.created_at) - new Date(b.created_at)
      case 'price_asc':  return a.price - b.price
      case 'price_desc': return b.price - a.price
      case 'stock_asc':  return a.stock - b.stock
      case 'stock_desc': return b.stock - a.stock
      case 'name_asc':   return a.name.localeCompare(b.name, 'tr')
      case 'name_desc':  return b.name.localeCompare(a.name, 'tr')
      default:           return new Date(b.created_at) - new Date(a.created_at)
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

  const handleAdd = async () => {
    setAdding(true)
    try {
      const { data, error } = await supabase.from('products').insert({
        name: form.name, price: parseFloat(form.price),
        stock: parseInt(form.stock), description: form.description,
        category: form.category, image_url: form.image_url || null
      }).select().single()
      if (error) throw error
      await supabase.from('order_logs').insert({ order_id: null, action: 'urun_eklendi', note: `"${data.name}" eklendi — ₺${data.price}, Stok: ${data.stock}` })
      setForm(emptyForm); setShowForm(false); setAdding(false)
      await fetchProducts()
    } catch (err) { console.error('Hata:', err); setAdding(false) }
  }

  const handleUpdate = async (id) => {
    const prev = products.find(p => p.id === id)
    await supabase.from('products').update({
      name: editForm.name, price: parseFloat(editForm.price),
      stock: parseInt(editForm.stock), description: editForm.description,
      category: editForm.category, image_url: editForm.image_url || null
    }).eq('id', id)
    const changes = []
    if (prev.price != editForm.price) changes.push(`Fiyat: ₺${prev.price} → ₺${editForm.price}`)
    if (prev.stock != editForm.stock) changes.push(`Stok: ${prev.stock} → ${editForm.stock}`)
    if (prev.name != editForm.name) changes.push(`Ad: "${prev.name}" → "${editForm.name}"`)
    await writeProductLog('urun_guncellendi', `"${editForm.name}" güncellendi${changes.length ? ` — ${changes.join(', ')}` : ''}`)
    setEditId(null)
    await fetchProducts()
  }

  const handleDelete = async () => {
    const p = deleteTarget
    await supabase.from('products').delete().eq('id', p.id)
    await writeProductLog('urun_silindi', `"${p.name}" silindi — ₺${p.price}`)
    setProducts(prev => prev.filter(x => x.id !== p.id))
    setDeleteTarget(null)
  }

  const handleDuplicate = async (p) => {
    const { data, error } = await supabase.from('products').insert({
      name: `${p.name} (Kopya)`, price: p.price, stock: p.stock,
      description: p.description, category: p.category, image_url: p.image_url
    }).select().single()
    if (!error) {
      await writeProductLog('urun_kopyalandi', `"${p.name}" kopyalandı`)
      await fetchProducts()
    }
  }

  const startEdit = (p) => {
    setEditId(p.id)
    setEditForm({ name: p.name, price: p.price, stock: p.stock, description: p.description || '', category: p.category || 'Diğer', image_url: p.image_url || '' })
  }

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id))

  return (
    <div>
      {deleteTarget && <ConfirmModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {showBulkStock && <BulkStockModal selected={selected} products={products} onClose={() => setShowBulkStock(false)} onSave={() => { setSelected([]); fetchProducts() }} />}

      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Ürünler <span className="text-gray-400 font-normal text-sm ml-1">({filtered.length})</span>
        </h2>
        <button onClick={() => { setShowForm(true); setForm(emptyForm) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition font-semibold">
          <Plus size={16} /> Ürün Ekle
        </button>
      </div>

      {/* Filtre toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"><X size={14} /></button>}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ürün adı veya açıklamasında ara..."
            className="w-full h-11 pl-11 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        <CategoryDropdown cats={cats} activeCat={activeCat} onChange={setActiveCat} />
        <SortDropdown sort={sort} onChange={setSort} />

        {/* Kritik stok filtresi */}
        <button onClick={() => setShowCriticalOnly(v => !v)}
          className={`flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition
            ${showCriticalOnly
              ? 'bg-red-500 text-white border-red-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'}`}>
          <AlertCircle size={15} />
          Kritik Stok
          {criticalCount > 0 && (
            <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${showCriticalOnly ? 'bg-white text-red-500' : 'bg-red-500 text-white'}`}>
              {criticalCount}
            </span>
          )}
        </button>
      </div>

      {/* Toplu seçim toolbar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-600 text-white px-5 py-3 rounded-xl mb-4 shadow-sm">
          <span className="text-sm font-semibold flex-1">{selected.length} ürün seçili</span>
          <button onClick={() => setShowBulkStock(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
            <PackagePlus size={15} /> Stok Güncelle
          </button>
          <button onClick={() => setSelected([])}
            className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Ürün Ekleme Formu */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-2 gap-4">
          {[['name','Ürün Adı','text'],['price','Fiyat (₺)','number'],['stock','Stok Adedi','number'],['description','Açıklama','text']].map(([key, label, type]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Kategori</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div />
          <ImageInput key={showForm ? 'open' : 'closed'} value={form.image_url} onChange={url => setForm({...form, image_url: url})} />
          <div className="col-span-2 flex gap-2">
            <button onClick={handleAdd} disabled={adding}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50 font-semibold">
              {adding ? 'Ekleniyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Ürünü Düzenle</h3>
              <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['name','Ürün Adı','text'],['price','Fiyat (₺)','number'],['stock','Stok','number'],['description','Açıklama','text']].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">{label}</label>
                  <input type={type} value={editForm[key]} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Kategori</label>
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div />
              <ImageInput value={editForm.image_url} onChange={url => setEditForm({...editForm, image_url: url})} />
              <div className="col-span-2 flex gap-2 mt-2">
                <button onClick={() => handleUpdate(editId)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition font-semibold">Güncelle</button>
                <button onClick={() => setEditId(null)} className="px-6 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Tümünü seç checkbox */}
            <input type="checkbox"
              checked={filtered.length > 0 && selected.length === filtered.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
            <h3 className="font-bold text-gray-800">Ürün Listesi</h3>
          </div>
          <span className="text-xs text-gray-400">
            {filtered.length !== products.length ? `${filtered.length} / ${products.length} ürün` : `${products.length} ürün`}
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-2 text-gray-400">
              <Search size={30} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Sonuç bulunamadı</p>
              <p className="text-xs">Arama veya kategori filtresini değiştirin</p>
            </div>
          ) : (
            filtered.map(p => {
              const isSelected = selected.includes(p.id)
              return (
                <div key={p.id} className={`flex items-center gap-4 px-5 py-3.5 transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  {/* Checkbox */}
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0" />

                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-blue-50 flex items-center justify-center">
                    {p.image_url ? <img src={optimizeUrl(p.image_url, 80)} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl">🪣</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.category || '—'}</span>
                      {!p.image_url && (
                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Image size={10} /> Görsel yok
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{p.description || 'Açıklama yok'}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-blue-700">₺{Number(p.price).toFixed(2)}</p>
                      <p className={`text-xs mt-0.5 ${p.stock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        {p.stock} adet {p.stock <= 5 && '⚠️'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(p)} title="Düzenle" className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDuplicate(p)} title="Kopyala" className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} title="Sil" className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}