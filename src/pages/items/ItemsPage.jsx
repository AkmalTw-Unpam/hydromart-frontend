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

// ==================== SUB COMPONENT: FORM BARANG ====================
function ItemForm({ form, setForm, categories, suppliers, errors, isEdit }) {
  const [preview, setPreview] = useState(null)

  // Mengatur preview gambar lama jika sedang mode edit
  useEffect(() => {
    if (isEdit && form.avatar_url) {
      setPreview(form.avatar_url)
    } else if (isEdit && form.image_url) {
      setPreview(form.image_url)
    } else {
      setPreview(null)
    }
  }, [isEdit, form.avatar_url, form.image_url])

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
            <input type="number" className="input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="150000" />
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

// ==================== MAIN COMPONENT: INTERFACE HALAMAN BARANG ====================
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

  // Mengambil data utama dari backend cloud
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [resItems, resCats, resSups] = await Promise.all([
        itemsApi.getAll(), // atau endpoint custom paginasimu
        categoriesApi.getAll(),
        suppliersApi.getAll()
      ])
      setItems(resItems.data?.data || resItems.data || [])
      setCategories(resCats.data || [])
      setSuppliers(resSups.data || [])
    } catch (err) {
      toast.error('Gagal mengambil data dari server cloud')
    } finally {
      setLoading(false)
    }
  }, [])

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
      price: item.price,
      location: item.location,
      description: item.description,
      avatar_url: item.avatar_url || item.image_url,
      image: null // file baru kosong sebelum user milih file baru
    })
    setErrors(null)
    setModalOpen(true)
  }

  // 🌟 JANTUNG UTAMA: PROSES SIMPAN / UPDATE BARANG DENGAN SPOOFING METHOD
  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setErrors(null)

      // Bungkus data ke dalam objek FormData browser
      const dataToSend = new FormData()
      dataToSend.append('name', form.name || '')
      dataToSend.append('category_id', form.category_id || '')
      dataToSend.append('supplier_id', form.supplier_id || '')
      dataToSend.append('unit', form.unit || 'Pcs')
      dataToSend.append('min_stock', form.min_stock || 0)
      dataToSend.append('price', form.price || 0)
      dataToSend.append('location', form.location || '')
      dataToSend.append('description', form.description || '')

      // Masukkan gambar jika ada file baru yang dipilih
      if (form.image) {
        dataToSend.append('image', form.image)
      }

      let response;

      if (selectedId) {
        // 🌟 JALUR EDIT: Tambahkan trik spoofing _method agar dibaca PUT oleh Laravel
        dataToSend.append('_method', 'PUT')
        
        // PENTING: Mengirimnya wajib memakai POST request murni Axios
        response = await axios.post(`/api/items/${selectedId}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Barang berhasil diperbarui')
      } else {
        // JALUR TAMBAH BARANG BARU
        dataToSend.append('stock', form.stock || 0)
        response = await axios.post('/api/items', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Barang berhasil ditambahkan')
      }

      setModalOpen(false)
      fetchData() // Refresh data tabel biar gambar langsung muncul
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(err.response?.data?.message || 'Terjadi kesalahan sistem data')
      }
    } finally {
      setSubmitting(false)
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

      {/* Tampilan Konten Utama (Tabel / Skeleton Loader) */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState icon={Package} title="Tidak ada barang" description="Mulai tambahkan barang inventaris pertamamu ke sistem." />
      ) : (
        <div className="card overflow-x-auto">
          {/* Taruh layout rendering tabel barang aslimu di sini... */}
          <p className="text-xs p-4 text-slate-400">Data termuat: {items.length} item. Klik ikon pensil untuk uji coba upload gambar baru.</p>
          
          {/* Pembuktian: tombol pemicu dummy edit cepat untuk testing */}
          <div className="p-4 space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center border">
                    {item.avatar_url || item.image_url ? (
                      <img src={item.avatar_url || item.image_url} alt="img" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold uppercase">{item.name.substring(0,2)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.code} • Stok: {item.stock}</p>
                  </div>
                </div>
                <button onClick={() => handleOpenEdit(item)} className="p-2 hover:bg-slate-200 dark:hover:bg-navy-700 rounded-lg text-primary-500">
                  <Pencil size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPONENT MODAL FORM TAMBAH / EDIT */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedId ? 'Edit Barang' : 'Tambah Barang'}>
        <ItemForm form={form} setForm={setForm} categories={categories} suppliers={suppliers} errors={errors} isEdit={!!selectedId} />
        <div className="flex justify-end gap-2 mt-6 border-t pt-4 dark:border-navy-700">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Batal</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : selectedId ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </Modal>
    </div>
  )
}