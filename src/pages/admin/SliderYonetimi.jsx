import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, optimizeUrl } from '../../lib/cloudinary'
import { Plus, Trash2, Pencil, Eye, EyeOff, Check, AlertTriangle, Tag, Package, Building2, Upload, X } from 'lucide-react'

const emptyForm = {
  title: '', highlight: '', description: '', badge: '',
  sort_order: 0, is_active: true,
  product_id: '',
  brand_logo_url: '', // ← YENİ: Firma logosu
}

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

function SlideForm({ initial, onSave, onCancel, saving, products }) {
  const [form, setForm] = useState(initial)
  const [logoMode, setLogoMode] = useState('url') // 'url' veya 'upload'
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const selectedProduct = products.find(p => String(p.id) === String(form.product_id))

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingLogo(true)
    try {
      const url = await uploadImage(file)
      setForm(prev => ({ ...prev, brand_logo_url: url }))
    } catch (err) {
      alert('Logo yüklenemedi: ' + err.message)
    }
    setUploadingLogo(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Başlık */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Başlık</label>
          <input value={form.title} onChange={f('title')} placeholder="Permolit Boya"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Beyaz renkte gösterilir</p>
        </div>

        {/* Vurgu */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Vurgu Metin</label>
          <input value={form.highlight} onChange={f('highlight')} placeholder="Doğu Anadolu Bayii"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Mavi renkte gösterilir</p>
        </div>

        {/* Açıklama */}
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Açıklama</label>
          <textarea value={form.description} onChange={f('description')}
            placeholder="Slide açıklaması..." rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {/* Badge */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Badge Yazısı</label>
          <input value={form.badge} onChange={f('badge')} placeholder="Orijinal & Güvenilir"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Sol üstteki küçük etiket</p>
        </div>

        {/* Sıra */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Sıra</label>
          <input type="number" value={form.sort_order} onChange={f('sort_order')} placeholder="0"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-[10px] text-gray-400 mt-1">Küçük sayı = öne çıkar</p>
        </div>

        {/* ─── YENİ: Firma Logosu ─── */}
        <div className="sm:col-span-2">
          <div className="border border-purple-100 bg-purple-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={14} className="text-purple-500" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Firma/Marka Logosu</span>
              <span className="text-[10px] text-purple-400">(isteğe bağlı)</span>
            </div>

            <div className="space-y-3">
              {/* Logo yükleme modu seçimi */}
              <div className="flex gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => setLogoMode('url')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${logoMode === 'url' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                  URL ile
                </button>
                <button 
                  type="button" 
                  onClick={() => setLogoMode('upload')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${logoMode === 'upload' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                  Dosya Yükle
                </button>
              </div>

              {/* Logo girişi */}
              <div>
                {logoMode === 'url' ? (
                  <>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Logo URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.brand_logo_url}
                        onChange={f('brand_logo_url')}
                        placeholder="https://example.com/permolit-logo.png"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {form.brand_logo_url && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, brand_logo_url: '' }))}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Permolit, Marshall, Filli Boya gibi firmaların logolarını ekleyebilirsin
                    </p>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Logo Dosyası</label>
                    <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-3 py-4 cursor-pointer transition ${uploadingLogo ? 'border-purple-300 bg-purple-50' : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload} 
                        disabled={uploadingLogo} 
                      />
                      {uploadingLogo
                        ? <span className="text-sm text-purple-600 font-medium flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            Yükleniyor...
                          </span>
                        : <span className="text-sm text-gray-500 flex items-center gap-2">
                            <Upload size={16} className="text-purple-500" /> 
                            Logo seç veya sürükle
                          </span>
                      }
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">
                      PNG, JPG veya SVG formatında yükleyebilirsin
                    </p>
                  </>
                )}
              </div>

              {/* Logo önizleme */}
              {form.brand_logo_url && (
                <div className="bg-white border border-purple-100 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-2">Logo Önizleme</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white border-2 border-purple-100 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                      <img
                        src={optimizeUrl(form.brand_logo_url, 120)}
                        alt="Firma Logosu"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center w-full h-full text-xs text-gray-400">
                        ❌ Yüklenemedi
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">Slide'da bu logo gösterilecek</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Sağ üst köşede veya başlığın yanında</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bilgi notu */}
              <div className="flex items-start gap-2.5 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                <Building2 size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-purple-700">Ne zaman kullanılır?</p>
                  <p className="text-[11px] text-purple-600 mt-0.5 leading-relaxed">
                    <strong>Permolit Boya Doğu Anadolu Bayii</strong>, <strong>Marshall Boya İşbirliği</strong> 
                    gibi slide'larda ilgili firmanın logosunu ekleyerek profesyonel bir görünüm kazandır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Ürün Bağlantısı ─── */}
        <div className="sm:col-span-2">
          <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Ürün Bağlantısı</span>
              <span className="text-[10px] text-blue-400">(isteğe bağlı)</span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Ürün seç */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Ürün Seç</label>
                <select
                  value={form.product_id}
                  onChange={f('product_id')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">— Ürün seçme (genel slide) —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₺{Number(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Seçilirse "Hemen Al" butonu çıkar ve ürün sayfasına gider
                </p>
              </div>

              {/* İndirim yönlendirme notu */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Tag size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700">İndirim eklemek mi istiyorsun?</p>
                  <p className="text-[11px] text-amber-600 mt-0.5 leading-relaxed">
                    İndirimler <span className="font-bold">Ürünler</span> sekmesinden her ürün için ayrı tanımlanıyor.
                    Oradan indirim ekledikten sonra bu slide otomatik indirimli fiyatı gösterir.
                  </p>
                </div>
              </div>
            </div>

            {/* Seçili ürün önizleme */}
            {selectedProduct && (
              <div className="mt-3 flex items-center gap-3 bg-white border border-blue-100 rounded-xl px-3 py-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {selectedProduct.image_url
                    ? <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    : <span className="text-base">🪣</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-blue-600 font-bold">₺{Number(selectedProduct.price).toFixed(2)}</p>
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold flex-shrink-0">
                  {selectedProduct.stock} stok
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Aktif toggle */}
        <div className="sm:col-span-2">
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
        
        {/* Logo + Badge */}
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          {/* Badge */}
          <div className="flex-1">
            {form.badge && (
              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                ⚡ {form.badge}
              </div>
            )}
          </div>
          
          {/* Firma Logosu */}
          {form.brand_logo_url && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 flex-shrink-0">
              <img
                src={optimizeUrl(form.brand_logo_url, 150)}
                alt="Firma Logosu"
                className="h-12 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Başlık */}
        <div className="text-2xl font-black leading-tight">
          <span className="text-white">{form.title || 'Başlık'}</span>
          <br />
          <span className="text-blue-400">{form.highlight || 'Vurgu Metin'}</span>
        </div>
        
        {/* Açıklama */}
        {form.description && (
          <p className="text-blue-200/60 text-xs mt-2 max-w-sm leading-relaxed">{form.description}</p>
        )}
        
        {/* Ürün butonu */}
        {selectedProduct && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            <Package size={11} /> Hemen Al →
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.highlight}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5">
          {saving
            ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Kaydediliyor...</>
            : <><Check size={14} />Kaydet</>}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">İptal</button>
      </div>
    </div>
  )
}

export default function SliderYonetimi() {
  const [slides, setSlides] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editInitial, setEditInitial] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchSlides = async () => {
    const { data } = await supabase
      .from('slides')
      .select('*, products(id, name, price, stock, image_url)')
      .order('sort_order')
    setSlides(data || [])
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, price, stock, image_url').order('name')
    setProducts(data || [])
  }

  useEffect(() => { fetchSlides(); fetchProducts() }, [])

  const buildPayload = (form) => ({
    title: form.title,
    highlight: form.highlight,
    description: form.description,
    badge: form.badge,
    sort_order: parseInt(form.sort_order) || 0,
    is_active: form.is_active,
    product_id: form.product_id ? parseInt(form.product_id) : null,
    brand_logo_url: form.brand_logo_url || null, // ← YENİ
    discount_text: null,
  })

  const handleAdd = async (form) => {
    setSaving(true)
    await supabase.from('slides').insert(buildPayload(form))
    setSaving(false); setShowForm(false); fetchSlides()
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    await supabase.from('slides').update(buildPayload(form)).eq('id', editId)
    setSaving(false); setEditId(null); setEditInitial(null); fetchSlides()
  }

  const handleDelete = async () => {
    await supabase.from('slides').delete().eq('id', deleteTarget)
    setDeleteTarget(null); fetchSlides()
  }

  const toggleActive = async (slide) => {
    await supabase.from('slides').update({ is_active: !slide.is_active }).eq('id', slide.id)
    fetchSlides()
  }

  const startEdit = (slide) => {
    setEditId(slide.id)
    setEditInitial({
      ...slide,
      product_id: slide.product_id ? String(slide.product_id) : '',
      brand_logo_url: slide.brand_logo_url || '', // ← YENİ
    })
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

      {showForm && (
        <SlideForm
          initial={emptyForm}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
          saving={saving}
          products={products}
        />
      )}

      <div className="flex flex-col gap-3">
        {slides.length === 0 && !showForm && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-2 text-gray-400">
            <p className="text-sm font-medium">Henüz slide yok</p>
            <p className="text-xs">Yukarıdan ekleyebilirsin</p>
          </div>
        )}

        {slides.map((slide, i) => (
          <div key={slide.id}>
            {editId === slide.id ? (
              <SlideForm
                initial={editInitial}
                onSave={handleUpdate}
                onCancel={() => { setEditId(null); setEditInitial(null) }}
                saving={saving}
                products={products}
              />
            ) : (
              <div className={`bg-white rounded-xl border transition ${slide.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                <div className="flex items-center gap-3 p-4">
                  {/* Sıra */}
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {i + 1}
                  </div>

                  {/* Firma Logosu (küçük önizleme) */}
                  {slide.brand_logo_url && (
                    <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                      <img
                        src={optimizeUrl(slide.brand_logo_url, 80)}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

                  {/* İçerik */}
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
                    {/* Bağlı ürün */}
                    {slide.products && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Package size={10} className="text-purple-500" />
                        <span className="text-[11px] text-purple-600 font-semibold">{slide.products.name}</span>
                        <span className="text-[11px] text-gray-400">₺{Number(slide.products.price).toFixed(2)}</span>
                      </div>
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

                  {/* Aksiyon */}
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