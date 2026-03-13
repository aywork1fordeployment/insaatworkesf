import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Pencil, X, Check, AlertTriangle, ChevronRight, FolderOpen, Folder } from 'lucide-react'

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Kategoriyi Sil</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Vazgeç</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Evet, Sil</button>
        </div>
      </div>
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [newParent, setNewParent] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editParent, setEditParent] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selected, setSelected] = useState([]) // toplu seçim

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

 useEffect(() => {
  fetchCategories()

  const channel = supabase.channel('categories-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
      fetchCategories()
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])

  const parents = categories.filter(c => !c.parent_id)
  const childrenOf = (parentId) => categories.filter(c => c.parent_id === parentId)

const handleAdd = async () => {
  if (!newName.trim()) return
  setAdding(true)
  try {
    const { data, error } = await supabase.from('categories').insert({
      name: newName.trim(),
      parent_id: newParent ? parseInt(newParent) : null
    }).select().single()
    
    if (error) throw error
    
    setNewName('')
    await fetchCategories()
  } catch (err) {
    alert('HATA: ' + err.message)
  } finally {
    setAdding(false)
  }
}
const handleUpdate = async (id) => {
  if (!editName.trim()) return
  const { data, error } = await supabase.from('categories').update({
    name: editName.trim(),
    parent_id: editParent ? parseInt(editParent) : null
  }).eq('id', id).select().single()

  if (!error && data) {
    setCategories(prev => prev.map(c => c.id === id ? data : c))
  }
  setEditId(null)
}
const handleDelete = async () => {
  const childIds = categories.filter(c => c.parent_id === deleteTarget.id).map(c => c.id)
  await supabase.from('categories').delete().eq('parent_id', deleteTarget.id)
  await supabase.from('categories').delete().eq('id', deleteTarget.id)
  setCategories(prev => prev.filter(c => c.id !== deleteTarget.id && !childIds.includes(c.id)))
  setSelected(prev => prev.filter(id => id !== deleteTarget.id && !childIds.includes(id)))
  setDeleteTarget(null)
}
const handleBulkDelete = async () => {
  const childIds = categories.filter(c => selected.includes(c.parent_id)).map(c => c.id)
  for (const id of selected) {
    await supabase.from('categories').delete().eq('parent_id', id)
    await supabase.from('categories').delete().eq('id', id)
  }
  setCategories(prev => prev.filter(c => !selected.includes(c.id) && !childIds.includes(c.id)))
  setSelected([])
}

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelected(selected.length === categories.length ? [] : categories.map(c => c.id))
  }

  return (
    <div>
      {deleteTarget && (
        <ConfirmModal
          message={
            childrenOf(deleteTarget.id).length > 0
              ? `"${deleteTarget.name}" ve ${childrenOf(deleteTarget.id).length} alt kategorisi silinecek. Bu işlem geri alınamaz.`
              : `"${deleteTarget.name}" silinecek. Bu işlem geri alınamaz.`
          }
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Kategoriler <span className="text-gray-400 font-normal text-sm ml-1">({categories.length})</span>
        </h2>
      </div>

      {/* Yeni kategori ekleme */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Yeni Kategori Ekle</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Kategori adı..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={newParent} onChange={e => setNewParent(e.target.value)}
            className="sm:w-56 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">📁 Ana Kategori (Üst Seviye)</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>↳ {p.name} altına ekle</option>
            ))}
          </select>
          <button onClick={handleAdd} disabled={adding || !newName.trim()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            <Plus size={16} /> Ekle
          </button>
        </div>
        {newParent && (
          <p className="text-xs text-blue-600 mt-2 font-medium">
            ↳ <span className="font-bold">{parents.find(p => p.id === parseInt(newParent))?.name}</span> kategorisinin altına eklenecek
          </p>
        )}
      </div>

      {/* Toplu seçim toolbar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-2.5 rounded-xl mb-4 shadow-sm">
          <span className="text-sm font-semibold flex-1">{selected.length} kategori seçili</span>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
            <Trash2 size={13} /> Seçilenleri Sil
          </button>
          <button onClick={() => setSelected([])} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Kategori listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <input type="checkbox"
            checked={categories.length > 0 && selected.length === categories.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
          <h3 className="font-bold text-gray-800 flex-1">Kategori Listesi</h3>
          <span className="text-xs text-gray-400">{categories.length} kategori</span>
        </div>

        <div className="divide-y divide-gray-50">
          {parents.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">Henüz kategori yok.</div>
          )}

          {parents.map(parent => (
            <div key={parent.id}>
              {/* Ana kategori satırı */}
              <div className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition ${selected.includes(parent.id) ? 'bg-blue-50' : 'bg-slate-50/60'}`}>
                <input type="checkbox" checked={selected.includes(parent.id)} onChange={() => toggleSelect(parent.id)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0" />
                <FolderOpen size={15} className="text-blue-500 flex-shrink-0" />

                {editId === parent.id ? (
                  <>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(parent.id)}
                      autoFocus
                      className="flex-1 border border-blue-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={editParent} onChange={e => setEditParent(e.target.value)}
                      className="w-44 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none bg-white">
                      <option value="">Ana Kategori</option>
                      {parents.filter(p => p.id !== parent.id).map(p => (
                        <option key={p.id} value={p.id}>↳ {p.name}</option>
                      ))}
                    </select>
                    <button onClick={() => handleUpdate(parent.id)} className="text-green-600 p-1.5 hover:bg-green-50 rounded-lg transition"><Check size={15} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-bold text-gray-800">{parent.name}</span>
                    {childrenOf(parent.id).length > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold mr-1">
                        {childrenOf(parent.id).length} alt
                      </span>
                    )}
                    <button onClick={() => { setEditId(parent.id); setEditName(parent.name); setEditParent('') }}
                      className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget(parent)}
                      className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                  </>
                )}
              </div>

              {/* Alt kategoriler */}
              {childrenOf(parent.id).map(child => (
                <div key={child.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition ${selected.includes(child.id) ? 'bg-blue-50' : ''}`}
                  style={{ paddingLeft: '3rem' }}>
                  <input type="checkbox" checked={selected.includes(child.id)} onChange={() => toggleSelect(child.id)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0" />
                  <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                  <Folder size={13} className="text-slate-400 flex-shrink-0" />

                  {editId === child.id ? (
                    <>
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdate(child.id)}
                        autoFocus
                        className="flex-1 border border-blue-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select value={editParent} onChange={e => setEditParent(e.target.value)}
                        className="w-44 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none bg-white">
                        <option value="">Ana Kategori</option>
                        {parents.map(p => (
                          <option key={p.id} value={p.id}>↳ {p.name}</option>
                        ))}
                      </select>
                      <button onClick={() => handleUpdate(child.id)} className="text-green-600 p-1.5 hover:bg-green-50 rounded-lg transition"><Check size={15} /></button>
                      <button onClick={() => setEditId(null)} className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={15} /></button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-700">{child.name}</span>
                      <button onClick={() => { setEditId(child.id); setEditName(child.name); setEditParent(String(parent.id)) }}
                        className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(child)}
                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}