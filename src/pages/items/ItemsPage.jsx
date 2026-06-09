import { useState, useEffect, useCallback } from 'react'
import { itemsApi, categoriesApi, suppliersApi } from '../../services/api'
import { Modal, PageHeader, StockBadge, TableSkeleton, Pagination, EmptyState, ConfirmDialog, FormField, SearchInput } from '../../components/ui'
import { Plus, Pencil, Trash2, Package, SlidersHorizontal, QrCode, RefreshCw, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const INITIAL_FORM = {
  name: '', category_id: '', supplier_id: '', unit: 'Pcs',
  stock: 0, min_stock: 0, price: 0, location: '', description: '', image: null
}

const UNITS = ['Pcs', 'Set', 'Meter', 'Kg', 'Liter', 'Box', 'Roll', 'Lembar']

function ItemForm({ form, setForm, categories, suppliers, errors }) {
  const [preview, setPreview] = useState(null)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Nama Barang" required error={errors?.name}>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama barang" />
          </FormField>
        </div>
        <FormField label="Kategori" required error={errors?.category_id}>
          <select className="select" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
            <option value="">Pilih kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Supplier" error={errors?.supplier_id}>
          <select className="select" value={form.supplier_id} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))}>
            <option value="">Pilih supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label="Satuan" required error={errors?.unit}>
          <select className="select" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </FormField>
        <FormField label="Stok Awal" error={errors?.stock}>
          <input type="number" className="input" value={form.stock} min={0} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
        </FormField>
        <FormField label="Stok Minimum" error={errors?.min_stock}>
          <input type="number" className="input" value={form.min_stock} min={0} onChange={e => setForm(p => ({ ...p, min_stock: e.target.value }))} />
        </FormField>
        <FormField label="Harga/Satuan (Rp)" error={errors?.price}>
          <input type="number" className="input" value={form.price} min={0} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </FormField>
        <div className="col-span-2">
          <FormField label="Lokasi Gudang" error={errors?.location}>
            <input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Contoh: Rak A-01" />
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Foto Barang" error={errors?.image}>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
              {preview
                ? <img src={preview} className="w-12 h-12 rounded-lg object-cover" alt="preview" />
                : <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-navy-700 flex items-center justify-center"><Image size={20} className="text-slate-400" /></div>}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Klik untuk upload gambar</p>
                <p className="text-xs text-slate-400">JPG, PNG, max 2MB</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Keterangan" error={errors?.description}>
            <textarea className="textarea" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Deskripsi barang..." />
          </FormField>
        </div>
      </div>
    </div>
  )
}

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ stock: 0, notes: '' })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await itemsApi.list({ search, category_id: catFilter, status: statusFilter, page, per_page: 12 })
      setItems(data.data)
      setMeta(data.meta)
    } catch (_) {}
    setLoading(false)
  }, [search, catFilter, statusFilter, page])

  useEffect(() => { fetchItems() }, [fetchItems])

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data))
    suppliersApi.list({ per_page: 999 }).then(r => setSuppliers(r.data.data))
  }, [])

  const openCreate = () => {
    setEditItem(null)
    setForm(INITIAL_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      name: item.name, category_id: item.category_id,
      supplier_id: item.supplier_id || '', unit: item.unit,
      stock: item.stock, min_stock: item.min_stock,
      price: item.price, location: item.location || '',
      description: item.description || '', image: null,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormErrors({})
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v) })
    try {
      if (editItem) {
        fd.append('_method', 'PUT')
        await itemsApi.update(editItem.id, fd)
        toast.success('Barang berhasil diperbarui.')
      } else {
        await itemsApi.create(fd)
        toast.success('Barang berhasil ditambahkan.')
      }
      setModalOpen(false)
      fetchItems()
    } catch (err) {
      if (err.response?.status === 422) setFormErrors(err.response.data.errors || {})
      else toast.error(err.response?.data?.message || 'Gagal menyimpan.')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await itemsApi.delete(deleteTarget.id)
      toast.success('Barang dihapus.')
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus.')
    }
    setDeleting(false)
  }

  const openAdjust = (item) => {
    setAdjustTarget(item)
    setAdjustForm({ stock: item.stock, notes: '' })
    setAdjustOpen(true)
  }

  const handleAdjust = async () => {
    setSaving(true)
    try {
      await itemsApi.adjust(adjustTarget.id, adjustForm)
      toast.success('Stok berhasil disesuaikan.')
      setAdjustOpen(false)
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyesuaikan stok.')
    }
    setSaving(false)
  }

  const fmtRp = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manajemen Barang"
        subtitle="Kelola seluruh data barang dalam inventaris gudang"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Tambah Barang
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Cari nama atau kode barang..." />
          </div>
          <select className="select w-44" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select w-36" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Status</option>
            <option value="low">Stok Menipis</option>
            <option value="empty">Stok Habis</option>
          </select>
          <button onClick={fetchItems} className="btn-ghost p-2.5 rounded-xl"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton cols={7} rows={10} /> : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Barang</th><th>Kategori</th><th>Supplier</th>
                  <th>Stok</th><th>Min. Stok</th><th>Harga</th>
                  <th>Status</th><th>Lokasi</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9}>
                    <EmptyState icon={Package} title="Tidak ada barang" description="Tambahkan barang baru untuk memulai." action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus size={14} /> Tambah Barang</button>} />
                  </td></tr>
                ) : items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt={item.name} className="w-9 h-9 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.code}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge text-xs" style={{ background: item.category?.color + '22', color: item.category?.color }}>
                        {item.category?.name}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{item.supplier?.name || '—'}</td>
                    <td>
                      <span className={clsx('font-semibold text-sm', item.status === 'empty' ? 'text-red-500' : item.status === 'low' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200')}>
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{item.min_stock} {item.unit}</td>
                    <td className="text-xs font-medium">{fmtRp(item.price)}</td>
                    <td><StockBadge status={item.status} /></td>
                    <td className="text-xs text-slate-500">{item.location || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openAdjust(item)} className="btn-ghost w-8 h-8 p-0 rounded-lg" title="Sesuaikan Stok">
                          <SlidersHorizontal size={14} />
                        </button>
                        <button onClick={() => openEdit(item)} className="btn-ghost w-8 h-8 p-0 rounded-lg" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="btn-ghost w-8 h-8 p-0 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `Edit: ${editItem.name}` : 'Tambah Barang Baru'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </>
        }
      >
        <ItemForm form={form} setForm={setForm} categories={categories} suppliers={suppliers} errors={formErrors} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Barang"
        message={`Yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Adjust Stock Modal */}
      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title={`Sesuaikan Stok: ${adjustTarget?.name}`}
        size="sm"
        footer={
          <>
            <button onClick={() => setAdjustOpen(false)} className="btn-secondary">Batal</button>
            <button onClick={handleAdjust} disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-navy-800 rounded-xl text-sm">
            <span className="text-slate-500">Stok saat ini: </span>
            <span className="font-bold text-slate-800 dark:text-white">{adjustTarget?.stock} {adjustTarget?.unit}</span>
          </div>
          <FormField label="Stok Baru" required>
            <input type="number" min={0} className="input" value={adjustForm.stock}
              onChange={e => setAdjustForm(p => ({ ...p, stock: e.target.value }))} />
          </FormField>
          <FormField label="Alasan Penyesuaian" required>
            <textarea rows={2} className="textarea" value={adjustForm.notes}
              onChange={e => setAdjustForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Contoh: Hasil stock opname..." />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
