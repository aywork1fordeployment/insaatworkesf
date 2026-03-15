import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, X, AlertTriangle  } from 'lucide-react'

const STATUS_MAP = {
  pending:    { label: 'Bekliyor',     cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Hazırlanıyor', cls: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Tamamlandı',   cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'İptal',        cls: 'bg-red-100 text-red-600' },
}

function ApproveModal({ order, onClose, onSave }) {
  const [discountRate, setDiscountRate] = useState(order.discount_rate || 0)
  const [taxRate, setTaxRate] = useState(order.tax_rate || 20)
  const [adminNote, setAdminNote] = useState(order.admin_note || '')
  const [status, setStatus] = useState(order.status)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const handleDelete = async () => {
  await supabase.from('order_logs').delete().eq('order_id', order.id)
  await supabase.from('orders').delete().eq('id', order.id)
  onSave()
  onClose()
}
const saveOnly = async () => {
  const finalPrice = useCustomPrice && customFinalPrice !== ''
    ? Number(customFinalPrice)
    : afterDiscount

  const updatedItems = order.order_items?.map((item, i) => ({
    ...item,
    cancelled: cancelledItems[i] || false
  })) || []

  await supabase.from('orders').update({
    status,
    discount_rate: useCustomPrice ? 0 : Number(discountRate),
    discount_amount: useCustomPrice ? 0 : discountAmt,
    tax_rate: taxRate,
    tax_amount: afterDiscount * taxRate / (100 + taxRate),
    final_price: finalPrice,
    admin_note: adminNote,
    approved_at: status === 'completed' ? new Date().toISOString() : null,
    order_items: updatedItems,
  }).eq('id', order.id)

  onSave()
}


 const handlePrint = async () => {
  await saveOnly()

  const printItems = order.order_items?.map((item, i) => ({
    ...item,
    cancelled: cancelledItems[i] || false
  })) || []

const items = printItems.filter(i => !i.cancelled)
const cancelled = printItems.filter(i => i.cancelled)
const base = items.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0)
const discountRateVal = Number(discountRate) || 0
const discount = base * discountRateVal / 100
const afterDisc = base - discount
const tax = afterDisc * taxRate / (100 + taxRate)
const total = useCustomPrice && customFinalPrice !== '' ? Number(customFinalPrice) : afterDisc
const date = new Date(order.created_at).toLocaleString('tr-TR')
  const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8">
<title>Sipariş #${order.id} — ESF Yapı</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Source Sans 3', 'Helvetica Neue', sans-serif; background: #fff; color: #111827; font-size: 13px; }
  .page { max-width: 680px; margin: 0 auto; padding: 40px 40px 60px; }

  /* HEADER */
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #111827; }
  .logo-area { display: flex; align-items: center; gap: 12px; }
  .logo-box { width: 44px; height: 44px; background: #1d4ed8; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .logo-box img { width: 30px; height: 30px; object-fit: contain; }
  .company-name { font-size: 17px; font-weight: 700; font-family: 'Playfair Display', serif; letter-spacing: -0.2px; color: #111827; }
  .company-sub { font-size: 11px; color: #6b7280; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 1px; }
  .order-badge { text-align: right; }
  .order-num { font-size: 22px; font-weight: 700; color: #1d4ed8; font-family: 'DM Mono', monospace; }
  .order-num { font-size: 24px; font-weight: 800; font-family: 'Playfair Display', serif; color: #1d4ed8; }
  .status-pill { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #dbeafe; color: #1d4ed8; }

  /* CUSTOMER */
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
  .customer-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px; }
  .customer-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px; }
  .customer-row { display: flex; gap: 24px; flex-wrap: wrap; }
  .customer-item { font-size: 12px; color: #6b7280; }
  .customer-item span { color: #374151; font-weight: 500; }
  .note-box { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #6b7280; }
  .note-box b { color: #374151; }

  /* TABLE */
  .items-section { margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #111827; color: #fff; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  thead th:last-child { text-align: right; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody tr:hover { background: #f8fafc; }
  tbody td { padding: 10px 12px; font-size: 13px; color: #374151; vertical-align: middle; }
  tbody td:last-child { text-align: right; font-weight: 700; color: #111827; font-family: 'Source Sans 3', sans-serif; }
  /* EKLE */
.items-section { page-break-inside: auto; }
tbody tr { page-break-inside: avoid; page-break-after: auto; }
.totals { page-break-inside: avoid; }
.customer-box { page-break-inside: avoid; }
.admin-note { page-break-inside: avoid; }
.footer { page-break-inside: avoid; }

@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 20px; }
  thead { display: table-header-group; }
  tbody { display: table-row-group; }
}
.qty-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border-radius: 6px; padding: 2px 7px; font-size: 11px; font-weight: 700; font-family: 'Source Sans 3', sans-serif; }

  /* CANCELLED */
  .cancelled-row td { color: #d1d5db; text-decoration: line-through; background: #fafafa; }
  .cancelled-badge { display: inline-block; background: #fee2e2; color: #ef4444; border-radius: 6px; padding: 2px 7px; font-size: 10px; font-weight: 700; margin-right: 6px; text-decoration: none; }

  /* TOTALS */
  .totals { margin-left: auto; width: 260px; margin-top: 4px; }
.total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #6b7280; border-bottom: 1px solid #f1f5f9; font-family: 'Source Sans 3', sans-serif; }
  .total-row.discount { color: #16a34a; }
  .total-row.tax { font-size: 11px; color: #9ca3af; }
.total-final { display: flex; justify-content: space-between; align-items: center; padding: 16px 0 4px; gap: 24px; font-size: 17px; font-weight: 700; font-family: 'Playfair Display', serif;color: #111827; border-top: 2px solid #111827; margin-top: 4px; }
.total-final .amount { color: #1d4ed8; font-family: 'Source Sans 3', sans-serif; font-weight: 800; }

  /* ADMIN NOTE */
  .admin-note { margin-top: 28px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; background: #fffbeb; }
  .admin-note .label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #d97706; margin-bottom: 4px; }
  .admin-note p { font-size: 12px; color: #92400e; }

  /* FOOTER */
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 11px; color: #9ca3af; }
.footer-right { font-size: 11px; color: #d1d5db; font-family: 'Source Sans 3', sans-serif; }

  /* DIVIDER */
  .divider { border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 20px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo-area">
      <div class="logo-box">
        <img src="${window.location.origin}/logo.png" onerror="this.style.display='none'" />
      </div>
      <div>
        <div class="company-name">ESF Yapı & İnşaat</div>
        <div class="company-sub">Boya & Sarf Malzemeleri</div>
      </div>
    </div>
    <div class="order-badge">
      <div class="order-num">#${order.id}</div>
      <div class="order-date">${date}</div>
      <div class="status-pill">${STATUS_MAP[order.status]?.label || order.status}</div>
    </div>
  </div>

  <!-- MÜŞTERİ -->
  <div class="section-title">Müşteri Bilgileri</div>
  <div class="customer-box">
    <div class="customer-name">${order.full_name || '—'}</div>
    <div class="customer-row">
      ${order.email ? `<div class="customer-item">✉ <span>${order.email}</span></div>` : ''}
      ${order.phone_number ? `<div class="customer-item">📞 <span>${order.phone_number}</span></div>` : ''}
    </div>
    ${order.customer_note ? `<div class="note-box"><b>Müşteri Notu:</b> ${order.customer_note}</div>` : ''}
  </div>

  <!-- ÜRÜNLER -->
  <div class="section-title">Sipariş Kalemleri</div>
  <div class="items-section">
    <table>
      <thead>
        <tr>
          <th>Ürün</th>
          <th>Adet</th>
          <th>Birim Fiyat</th>
          <th>Toplam</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(i => `
        <tr>
          <td>${i.name}</td>
          <td><span class="qty-badge">${i.quantity}</span></td>
<td style="font-family:'Source Sans 3',sans-serif;font-weight:600">₺${Number(i.price).toFixed(2)}</td>
          <td>₺${(Number(i.price) * i.quantity).toFixed(2)}</td>
        </tr>`).join('')}
        ${cancelled.map(i => `
        <tr class="cancelled-row">
          <td><span class="cancelled-badge">İPTAL</span>${i.name}</td>
          <td>${i.quantity}</td>
          <td>₺${Number(i.price).toFixed(2)}</td>
          <td>₺${(Number(i.price) * i.quantity).toFixed(2)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- TOPLAM -->
  <div class="totals">
<div class="total-row"><span>Ara Toplam</span><span style="font-family:'Source Sans 3',sans-serif;font-weight:600">    ${discount > 0 ? `<div class="total-row discount"><span>İndirim ${discountRate > 0 ? `(%${discountRate})` : ''}</span><span>-₺${discount.toFixed(2)}</span></div>` : ''}
    ${tax > 0 ? `<div class="total-row tax"><span>KDV (dahil)</span><span>₺${tax.toFixed(2)}</span></div>` : ''}
    <div class="total-final"><span>Genel Toplam</span><span class="amount">₺${total.toFixed(2)}</span></div>
  </div>

  ${order.admin_note ? `
  <hr class="divider">
  <div class="admin-note">
    <div class="label">⚡ ESF Yapı Notu</div>
    <p>${order.admin_note}</p>
  </div>` : ''}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">ESF Yapı & İnşaat — esfyapi.tr</div>
    <div class="footer-right">SIP-${String(order.id).padStart(6, '0')}</div>
  </div>

</div>
</body></html>`

const blob = new Blob([html], { type: 'text/html' })
const url = URL.createObjectURL(blob)
const win = window.open(url, '_blank')
win.onload = () => { win.print(); URL.revokeObjectURL(url) }
}
  const [restoreStock, setRestoreStock] = useState(false)
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [customFinalPrice, setCustomFinalPrice] = useState('')
  const [cancelledItems, setCancelledItems] = useState(
    (order.order_items || []).reduce((acc, item, i) => ({ ...acc, [i]: item.cancelled || false }), {})
  )

  const toggleItemCancel = (i) => {
    setCancelledItems(prev => ({ ...prev, [i]: !prev[i] }))
  }

  // İptal edilmeyen kalemlerin toplamı
const base = order.order_items?.length
  ? order.order_items.reduce((sum, item, i) => {
      if (cancelledItems[i]) return sum
      return sum + (Number(item.price) * item.quantity)
    }, 0)
  : Number(order.total_price) || 0

const originalBase = Number(order.total_price) || 0
  const discountAmt = base * (Number(discountRate) || 0) / 100
  const afterDiscount = base - discountAmt
  const taxAmt = afterDiscount * taxRate / (100 + taxRate)
  const final = useCustomPrice && customFinalPrice !== ''
    ? Number(customFinalPrice)
    : afterDiscount

  const handleSave = async () => {
    const finalPrice = useCustomPrice && customFinalPrice !== ''
      ? Number(customFinalPrice)
      : afterDiscount

    const updatedItems = order.order_items?.map((item, i) => ({
      ...item,
      cancelled: cancelledItems[i] || false
    })) || []

    await supabase.from('orders').update({
      status,
      discount_rate: useCustomPrice ? 0 : Number(discountRate),
      discount_amount: useCustomPrice ? 0 : discountAmt,
      tax_rate: taxRate,
      tax_amount: afterDiscount * taxRate / (100 + taxRate),
      final_price: finalPrice,
      admin_note: adminNote,
      approved_at: status === 'completed' ? new Date().toISOString() : null,
      order_items: updatedItems,
    }).eq('id', order.id)

    if (status === 'cancelled' && restoreStock && order.order_items?.length) {
      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from('products').select('stock').eq('id', item.product_id).single()
        if (product) {
          await supabase.from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.product_id)
        }
      }
    }

    const cancelledNames = Object.entries(cancelledItems)
      .filter(([, v]) => v)
      .map(([i]) => order.order_items[i]?.name)
      .filter(Boolean)

    const logNote = useCustomPrice
      ? `Durum: ${STATUS_MAP[status]?.label} | Özel fiyat: ₺${finalPrice.toFixed(2)}${cancelledNames.length ? ` | İptal kalemler: ${cancelledNames.join(', ')}` : ''}${restoreStock && status === 'cancelled' ? ' | Stok iade edildi' : ''}${adminNote ? ` | Not: ${adminNote}` : ''}`
      : `Durum: ${STATUS_MAP[status]?.label}${Number(discountRate) > 0 ? ` | İskonto: %${discountRate} (₺${discountAmt.toFixed(2)})` : ''}${cancelledNames.length ? ` | İptal kalemler: ${cancelledNames.join(', ')}` : ''}${restoreStock && status === 'cancelled' ? ' | Stok iade edildi' : ''} | Toplam: ₺${finalPrice.toFixed(2)}${adminNote ? ` | Not: ${adminNote}` : ''}`

    await supabase.from('order_logs').insert({
      order_id: order.id,
      action: status === 'completed' ? 'siparis_tamamlandi' :
              status === 'cancelled' ? 'siparis_iptal' :
              cancelledNames.length ? 'kalem_iptal' :
              useCustomPrice ? 'ozel_fiyat_uygulandi' :
              Number(discountRate) > 0 ? 'iskonto_eklendi' : 'durum_guncellendi',
      note: logNote,
    })

    onSave(); onClose()
  }





return (
  <>
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Siparişi Sil</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              #{order.id} numaralı sipariş kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              Vazgeç
            </button>
            <button onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Sipariş #{order.id} — Düzenle</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePrint()}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-semibold shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Yazdır
              </button>
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition text-xs font-semibold border border-red-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Sil
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4">

            {/* Durum */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Durum</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {/* Müşteri */}
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(order.full_name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{order.full_name || '—'}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {order.email && <span className="truncate">✉ {order.email}</span>}
                    {order.phone_number && <span>📞 {order.phone_number}</span>}
                  </div>
                </div>
              </div>

              {order.order_items?.length > 0 ? (
                <div className="border-t border-slate-200 pt-2 mt-1 flex flex-col gap-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                    Sipariş İçeriği
                    <span className="normal-case text-orange-400 font-normal ml-1">— kalemi iptal için tıkla</span>
                  </p>
                  {order.order_items.map((item, i) => (
                    <div key={i}
                      onClick={() => toggleItemCancel(i)}
                      className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-2 cursor-pointer transition select-none border ${
                        cancelledItems[i] ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        {cancelledItems[i]
                          ? <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">İPTAL</span>
                          : <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        }
                        <span className={`font-medium truncate ${cancelledItems[i] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                        <span>{item.quantity} adet</span>
                        <span className={`font-semibold ${cancelledItems[i] ? 'text-red-300 line-through' : 'text-slate-600'}`}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {Object.values(cancelledItems).some(Boolean) && (
                    <p className="text-[10px] text-orange-600 bg-orange-50 rounded-lg px-2.5 py-1.5 border border-orange-100">
                      ⚠️ İptal edilen kalemler müşteriye gösterilecek.
                    </p>
                  )}
                </div>
              ) : order.customer_note ? (
                <div className="border-t border-slate-200 pt-2 mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Sipariş Notu</p>
                  <p className="text-xs text-slate-600">{order.customer_note}</p>
                </div>
              ) : null}
            </div>

            {/* Stok iadesi */}
            {status === 'cancelled' && order.order_items?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={restoreStock} onChange={e => setRestoreStock(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Stoğa iade et</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {order.order_items.map(i => `${i.name} (+${i.quantity})`).join(', ')}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Fiyat */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-3">
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5">
                  Ürün Tutarı
                  <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-semibold">KDV dahil</span>
                </span>
                <div className="text-right">
                  {base !== originalBase && (
                    <p className="text-xs text-gray-400 line-through">₺{originalBase.toFixed(2)}</p>
                  )}
                  <span>₺{base.toFixed(2)}</span>
                </div>
              </div>

              {base !== originalBase && (
                <div className="flex justify-between text-red-500 text-xs bg-red-50 rounded-lg px-3 py-1.5">
                  <span>İptal edilen kalemler</span>
                  <span>-₺{(originalBase - base).toFixed(2)}</span>
                </div>
              )}

              {!useCustomPrice && (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-gray-600 text-sm">Müşteri İndirimi (%)</p>
                    <p className="text-[10px] text-gray-400">Belirli müşteriye özel indirim</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input type="number" min="0" max="100" value={discountRate}
                      onChange={e => setDiscountRate(e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </div>
              )}

              {!useCustomPrice && Number(discountRate) > 0 && (
                <div className="flex justify-between text-green-600 text-xs bg-green-50 rounded-lg px-3 py-1.5">
                  <span>İndirim (%{discountRate})</span>
                  <span>-₺{discountAmt.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs">KDV Oranı (fiyata dahil)</p>
                  <p className="text-[10px] text-gray-400">Muhasebe için dahili bilgi</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input type="number" min="0" max="100" value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-400 text-xs bg-gray-100 rounded-lg px-3 py-1.5">
                <span>Dahili KDV ({taxRate}%)</span>
                <span>₺{taxAmt.toFixed(2)} (dahil)</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useCustomPrice}
                    onChange={e => { setUseCustomPrice(e.target.checked); if (!e.target.checked) setCustomFinalPrice('') }}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Özel son fiyat uygula</p>
                    <p className="text-[10px] text-gray-400">İskonto yerine direkt fiyat belirle</p>
                  </div>
                </label>
                {useCustomPrice && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₺</span>
                    <input type="number" min="0" value={customFinalPrice}
                      onChange={e => setCustomFinalPrice(e.target.value)}
                      placeholder="Örn: 150.00"
                      className="w-full border-2 border-blue-400 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {customFinalPrice && base > 0 && (
                      <p className="text-[10px] text-green-600 mt-1">
                        ₺{(base - Number(customFinalPrice)).toFixed(2)} indirim
                        ({((base - Number(customFinalPrice)) / base * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Genel Toplam</span>
                <span className="text-blue-700 text-base">₺{final.toFixed(2)}</span>
              </div>
            </div>

            {/* Admin notu */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">ESF Yapı</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                placeholder="Teslimat bilgisi, özel not..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders_with_email')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase.channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') setOrders(prev => [payload.new, ...prev])
        else if (payload.eventType === 'UPDATE') setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        else if (payload.eventType === 'DELETE') setOrders(prev => prev.filter(o => o.id !== payload.old.id))
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search ||
      o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
    return matchStatus && matchSearch
  })

  const counts = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {})

  if (loading) return <div className="text-gray-400 text-sm">Yükleniyor...</div>

  return (
    <div>
      {selectedOrder && (
        <ApproveModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={fetchOrders}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Siparişler</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <button key={k}
            onClick={() => setStatusFilter(statusFilter === k ? 'all' : k)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition text-xs font-semibold ${
              statusFilter === k ? v.cls + ' border-current' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
            }`}>
            <span>{v.label}</span>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              statusFilter === k ? 'bg-white/60' : 'bg-gray-100'
            }`}>{counts[k] || 0}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ad, email veya sipariş no..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">Tümü</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Sipariş bulunamadı.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(order => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.pending
              const base = Number(order.total_price) || 0
              const discount = Number(order.discount_amount) || 0
              const tax = Number(order.tax_amount) || 0
              const discountRate = Number(order.discount_rate) || 0
              const final = Number(order.final_price) || base
              const hascancelledItems = order.order_items?.some(i => i.cancelled)
              return (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-[11px] flex-shrink-0">
                        #{order.id}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{order.full_name || '—'}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${s.cls}`}>{s.label}</span>
                      {hascancelledItems && (
                        <span className="text-[10px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 hidden sm:inline">
                          Kısmi iptal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-blue-700 text-sm">₺{final.toFixed(2)}</p>
                      <button onClick={() => setSelectedOrder(order)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                        Düzenle
                      </button>
                    </div>
                  </div>

                  <div className="pl-10 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {order.email && (
                      <a href={`mailto:${order.email}`} className="text-xs text-gray-400 hover:text-blue-600 transition truncate max-w-[200px]">
                        ✉ {order.email}
                      </a>
                    )}
                    {order.phone_number && (
                      <a href={`tel:${order.phone_number}`} className="text-xs text-gray-400 hover:text-blue-600 transition flex-shrink-0">
                        📞 {order.phone_number}
                      </a>
                    )}
                    <span className="text-xs text-gray-300 flex-shrink-0">
                      {new Date(order.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>

                  {order.customer_note && (
                    <p className="pl-10 text-xs text-slate-500 mt-1 truncate">{order.customer_note.slice(0, 60)}</p>
                  )}

                  {(discount > 0 || tax > 0) && (
                    <div className="pl-10 flex items-center gap-3 mt-1 text-[11px]">
                      {discount > 0 && (
                        <span className="text-green-600">
                          {discountRate > 0 ? `%${discountRate} ` : ''}-₺{discount.toFixed(2)} indirim
                        </span>
                      )}
                      {tax > 0 && <span className="text-gray-400">KDV: ₺{tax.toFixed(2)} (dahil)</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}