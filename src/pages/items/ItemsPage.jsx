import { useState, useEffect, useCallback } from 'react'
import { itemsApi, categoriesApi, suppliersApi } from '../../services/api'
import { Modal, PageHeader, StockBadge, TableSkeleton, Pagination, EmptyState, ConfirmDialog, FormField, SearchInput } from '../../components/ui'
import { Plus, Pencil, Trash2, Package, SlidersHorizontal, RefreshCw, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import axios from 'axios'

const INITIAL_FORM = {
  name: '', category_id: '', supplier_id: '', unit: 'Pcs',
  stock: 0, min_stock: 0, price: 0, location: '', description: '', image: null
}

const UNITS = ['Pcs', 'Set', 'Meter', 'Kg', 'Liter', 'Box', 'Roll', 'Lembar']

// ==================== COMPONENT FORM (SUDAH DIPERBAIKI) ====================
function ItemForm({ form, setForm, categories, suppliers, errors, isEdit }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (isEdit && form.image_url) {
      setPreview(form.image_url)
    } else {
      setPreview(null)
    }
  }, [isEdit, form.image_url])

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
            {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>

        <FormField label="Supplier" error={errors?.supplier_id}>
          <select className="select" value={form.supplier_id || ''} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))}>
            <option value="">Pilih supplier</option>
            {(Array.isArray(suppliers) ? suppliers : []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FormField>

        <FormField label="Satuan" required error={errors?.unit}>
          {/* 🌟 AMAN: e.target.value sudah disinkronkan dengan benar */}
          <select className="select" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </FormField>

        <FormField label="Lokasi Gudang" error={errors?.location}>
          <input className="input" value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Contoh: Rak A-01" />
        </FormField>

        {!isEdit && (
          <FormField label="Stok Awal" error={errors?.stock}>
            <input type="number" className="input" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
          </FormField>
        )}

        <FormField label="Stok Minimum" error={errors?.min_stock}>
          <input type="number" className="input" value={form.min_stock} onChange={e => setForm(p => ({ ...p, min_stock: e.target.value }))} />
        </FormField>

        <div className="col-span-2">
          <FormField label="Harga / Satuan (Rp)" error={errors?.price}>
            <input type="number" className="input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="10000" />
          </FormField>
        </div>

        <div className="col-span-2">
          <FormField label="Foto Barang" error={errors?.image}>
            <div className="flex items-center gap-4 p-4 border border-dashed border-slate-200 dark:border-navy-700 rounded-xl">
              <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-navy-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-navy-700 flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" id="item-image-input" className="hidden" onChange={handleImage} />
                <label htmlFor="item-image-input" className="btn btn-secondary py-2 text-xs cursor-pointer inline-block">
                  Klik untuk upload gambar
                </label>
                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, max 2MB</p>
              </div>
            </div>
          </FormField>
        </div>

        <div className="col-span-2">
          <FormField label="Keterangan" error={errors?.description}>
            <textarea className="textarea" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Deskripsi barang..." rows={3} />
          </FormField>
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [meta, setMeta] = useState(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [resItems, resCats, resSups] = await Promise.all([
        itemsApi.getAll({ page, search, category_id: categoryFilter, status: statusFilter }),
        categoriesApi.getAll(),
        suppliersApi.getAll()
      ])
      setItems(resItems.data?.data || resItems.data || [])
      setMeta(resItems.data?.meta || resItems.data)
    } catch (err) {
      toast.error('Gagal mengambil data dari server cloud')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenAdd = () => {
    setSelectedId(null)
    setForm(INITIAL_FORM)
    setErrors(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setSelectedId(item.id)
    setForm({
      name: item.name,
      category_id: item.category_id,
      supplier_id: item.supplier_id,
      unit: item.unit,
      min_stock: item.min_stock,
      price: Math.floor(item.price),
      location: item.location,
      description: item.description,
      image_url: item.avatar_url || item.image_url,
      image: null
    })
    setErrors(null)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setErrors(null)

      const dataToSend = new FormData()
      dataToSend.append('name', form.name || '')
      dataToSend.append('category_id', form.category_id || '')
      dataToSend.append('supplier_id', form.supplier_id || '')
      dataToSend.append('unit', form.unit || 'Pcs')
      dataToSend.append('min_stock', form.min_stock || 0)
      dataToSend.append('price', form.price || 0)
      dataToSend.append('location', form.location || '')
      dataToSend.append('description', form.description || '')

      if (form.image) {
        dataToSend.append('image', form.image)
      }

      if (selectedId) {
        dataToSend.append('_method', 'PUT')
        await axios.post(`/api/items/${selectedId}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Barang berhasil diperbarui')
      } else {
        dataToSend.append('stock', form.stock || 0)
        await axios.post('/api/items', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Barang berhasil ditambahkan')
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(err.response?.data?.message || 'Terjadi kesalahan sistem')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await itemsApi.delete(deleteId)
      toast.success('Barang berhasil dihapus')
      setConfirmDeleteOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus barang')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Manajemen Barang" subtitle="Kelola seluruh data barang dalam inventaris gudang" />
        <button onClick={handleOpenAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-navy-800/20 p-4 rounded-xl border border-slate-100 dark:border-navy-800">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau kode barang..." />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <select className="select py-2 text-xs w-40" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select py-2 text-xs w-40" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Semua Status</option>
            <option value="normal">Normal</option>
            <option value="low">Stok Menipis</option>
            <option value="empty">Habis</option>
          </select>
          <button onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); setPage(1); }} className="p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg text-slate-500">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden border border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-900 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-800/50 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4">Barang</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-4 text-right">Stok</th>
                <th className="py-4 px-4 text-right">Min. Stok</th>
                <th className="py-4 px-4 text-right">Harga</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Lokasi</th>
                <th className="py-4 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-sm">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-navy-800 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-navy-700 flex-shrink-0">
                        {item.avatar_url || item.image_url ? (
                          <img src={item.avatar_url || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{item.name.substring(0, 2)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{item.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                      {item.category?.name || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 max-w-[140px] truncate">{item.supplier?.name || '—'}</td>
                  <td className="py-4 px-4 text-right font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className={clsx(parseFloat(item.stock) <= 0 ? 'text-red-500' : parseFloat(item.stock) <= parseFloat(item.min_stock) ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200')}>{parseFloat(item.stock).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">{parseFloat(item.min_stock).toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-right font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Rp {parseFloat(item.price).toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StockBadge stock={parseFloat(item.stock)} minStock={parseFloat(item.min_stock)} />
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.location || '—'}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-500 hover:text-primary-500 rounded-md">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => { setDeleteId(item.id); setConfirmDeleteOpen(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-500 hover:text-red-500 rounded-md">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {meta && (
          <div className="p-4 border-t dark:border-navy-800">
            <Pagination current={page} total={meta.last_page || meta.last_page_at || 1} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedId ? 'Edit Barang' : 'Tambah Barang'}>
        <ItemForm form={form} setForm={setForm} categories={categories} suppliers={suppliers} errors={errors} isEdit={!!selectedId} />
        <div className="flex justify-end gap-2 mt-6 border-t pt-4 dark:border-navy-700">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Batal</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : selectedId ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} onConfirm={handleDelete} title="Hapus Barang" message="Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan." type="danger" />
    </div>
  )
}