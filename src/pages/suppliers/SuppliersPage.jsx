import { useState, useEffect, useCallback } from 'react'
import { suppliersApi } from '../../services/api'
import { Modal, PageHeader, TableSkeleton, Pagination, EmptyState, ConfirmDialog, FormField, SearchInput } from '../../components/ui'
import { Plus, Pencil, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const INIT = { name: '', contact_person: '', phone: '', email: '', address: '', city: '', notes: '' }

export default function SuppliersPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(INIT)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await suppliersApi.list({ search, page, per_page: 12 })
      setRows(data.data); setMeta(data.meta)
    } catch (_) {}
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setEditTarget(null); setForm(INIT); setErrors({}); setModalOpen(true) }
  const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, contact_person: s.contact_person || '', phone: s.phone || '', email: s.email || '', address: s.address || '', city: s.city || '', notes: s.notes || '' }); setErrors({}); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true); setErrors({})
    try {
      if (editTarget) { await suppliersApi.update(editTarget.id, form); toast.success('Supplier diperbarui.') }
      else { await suppliersApi.create(form); toast.success('Supplier ditambahkan.') }
      setModalOpen(false); fetch()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else toast.error(err.response?.data?.message || 'Gagal menyimpan.')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await suppliersApi.delete(deleteTarget.id); toast.success('Supplier dihapus.'); setDeleteTarget(null); fetch() }
    catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.') }
    setDeleting(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manajemen Supplier"
        subtitle="Kelola data pemasok / vendor barang"
        actions={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> Tambah Supplier</button>}
      />

      <div className="card p-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Cari nama atau kode supplier..." />
      </div>

      {loading ? <TableSkeleton cols={6} rows={8} /> : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Kode</th><th>Nama Supplier</th><th>Kontak</th><th>Kota</th><th>Barang</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState icon={Truck} title="Belum ada supplier" action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus size={14} /> Tambah</button>} /></td></tr>
                ) : rows.map(s => (
                  <tr key={s.id}>
                    <td><span className="font-mono text-xs badge-slate">{s.code}</span></td>
                    <td>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{s.name}</p>
                      {s.contact_person && <p className="text-xs text-slate-400">{s.contact_person}</p>}
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        {s.phone && <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={11} />{s.phone}</p>}
                        {s.email && <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={11} />{s.email}</p>}
                      </div>
                    </td>
                    <td className="text-xs">{s.city ? <span className="flex items-center gap-1 text-slate-500"><MapPin size={11}/>{s.city}</span> : '—'}</td>
                    <td><span className="badge-blue">{s.items_count} item</span></td>
                    <td><span className={s.is_active ? 'badge-green' : 'badge-slate'}>{s.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="btn-ghost w-8 h-8 p-0 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(s)} className="btn-ghost w-8 h-8 p-0 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination meta={meta} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? `Edit: ${editTarget.name}` : 'Tambah Supplier'} size="md"
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button></>}>
        <div className="space-y-4">
          <FormField label="Nama Supplier" required error={errors?.name}>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Person" error={errors?.contact_person}>
              <input className="input" value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} />
            </FormField>
            <FormField label="No. Telepon" error={errors?.phone}>
              <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </FormField>
            <FormField label="Email" error={errors?.email}>
              <input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </FormField>
            <FormField label="Kota" error={errors?.city}>
              <input className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Alamat" error={errors?.address}>
            <textarea rows={2} className="textarea" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </FormField>
          <FormField label="Catatan" error={errors?.notes}>
            <textarea rows={2} className="textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Hapus Supplier" message={`Yakin hapus "${deleteTarget?.name}"?`} />
    </div>
  )
}
