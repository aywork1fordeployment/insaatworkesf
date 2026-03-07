import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Pencil, X, Check, AlertTriangle } from 'lucide-react'

function ConfirmModal({ name, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Kategoriyi Sil</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">"{name}"</span> kategorisi silinecek. Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
            Vazgeç
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  useEffect(() => { fetchCategories() }, [])

const handleAdd = async () => {
  if (!newName.trim()) return
  setAdding(true)
  await supabase.from('categories').insert({ name: newName.trim() })
  setNewName('')
  await fetchCategories() 
  setAdding(false)
}
const handleUpdate = async (id) => {
  if (!editName.trim()) return
  await supabase.from('categories').update({ name: editName.trim() }).eq('id', id)
  setEditId(null)
  await fetchCategories()  // await ekle
}

  const handleDelete = async () => {
    await supabase.from('categories').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    fetchCategories()
  }

  return (
    <div>
      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-bold text-gray-800">
    Kategoriler <span className="text-gray-400 font-normal text-sm ml-1">({categories.length})</span>
  </h2>

</div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex gap-3">
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Yeni kategori adı..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleAdd} disabled={adding || !newName.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          <Plus size={16} /> Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Kategori Listesi</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
              {editId === cat.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                    autoFocus
                    className="flex-1 border border-blue-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => handleUpdate(cat.id)}
                    className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded-lg transition">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name) }}
                    className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(cat)}
                    className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}