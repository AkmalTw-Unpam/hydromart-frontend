import { useState, useEffect, useCallback } from 'react'
import { categoriesApi } from '../../services/api'
import { Modal, PageHeader, EmptyState, ConfirmDialog, FormField } from '../../components/ui'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#0ABFBC','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#10B981','#F97316','#EC4899','#6366F1','#14B8A6']
const INIT = { name: '', code: '', color: '#0ABFBC', description: '' }

export default function CategoriesPage() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(INIT)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try { const { data } = await categoriesApi.list(); setCats(data) } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setEditTarget(null); setForm(INIT); setErrors({}); setModalOpen(true) }
  const openEdit = c => { setEditTarget(c); setForm({ name: c.name, code: c.code, color: c.color, description: c.description || '' }); setErrors({}); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true); setErrors({})
    try {
      if (editTarget) { await categoriesApi.update(editTarget.id, form); toast.success('Kategori diperbarui.') }
      else { await categoriesApi.create(form); toast.success('Kategori ditambahkan.') }
      setModalOpen(false); fetch()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else toast.error(err.response?.data?.message || 'Gagal.')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await categoriesApi.delete(deleteTarget.id); toast.success('Kategori dihapus.'); setDeleteTarget(null); fetch() }
    catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.') }
    setDeleting(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kategori Barang"
        subtitle="Kelola pengelompokan jenis barang gudang"
        actions={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> Tambah Kategori</button>}
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : cats.length === 0 ? (
        <div className="card"><EmptyState icon={Tag} title="Belum ada kategori" action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus size={14} />Tambah</button>} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.map(c => (
            <div key={c.id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: c.color }}>
                  {c.code}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="btn-ghost w-7 h-7 p-0 rounded-lg"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteTarget(c)} className="btn-ghost w-7 h-7 p-0 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{c.name}</p>
              {c.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>}
              <p className="text-xs font-semibold mt-3" style={{ color: c.color }}>{c.items_count} barang</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? `Edit: ${editTarget.name}` : 'Tambah Kategori'} size="sm"
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button></>}>
        <div className="space-y-4">
          <FormField label="Nama Kategori" required error={errors?.name}>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Pipa & Fitting" />
          </FormField>
          <FormField label="Kode (3 huruf)" required error={errors?.code}>
            <input className="input uppercase" maxLength={5} value={form.code}
              onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="PPF" />
          </FormField>
          <FormField label="Warna Label">
            <div className="flex flex-wrap gap-2 mt-1">
              {COLORS.map(col => (
                <button key={col} type="button" onClick={() => setForm(p => ({ ...p, color: col }))}
                  className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${form.color === col ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ background: col }} />
              ))}
            </div>
          </FormField>
          <FormField label="Deskripsi" error={errors?.description}>
            <textarea rows={2} className="textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Hapus Kategori" message={`Yakin hapus kategori "${deleteTarget?.name}"? Pastikan tidak ada barang di kategori ini.`} />
    </div>
  )
}
