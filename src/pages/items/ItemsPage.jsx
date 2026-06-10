import { useState, useEffect, useCallback } from 'react'
import { itemsApi, categoriesApi, suppliersApi } from '../../services/api'
import { Modal, PageHeader, StockBadge, TableSkeleton, Pagination, EmptyState, ConfirmDialog, FormField, SearchInput } from '../../components/ui'
import { Plus, Pencil, Trash2, Package, SlidersHorizontal, RefreshCw, Image } from 'lucide-react'
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
            {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
      </div>
    </div>
  )
}

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
  const [meta, setMeta] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [resItems, resCats, resSups] = await Promise.all([
        itemsApi.getAll({ page }),
        categoriesApi.getAll(),
        suppliersApi.getAll()
      ])
      
      // Mengembalikan ke pembacaan objek data pagination asli bawaan aplikasimu
      setItems(resItems.data?.data || [])
      setMeta(resItems.data)
    } catch (err) {
      toast.error('Gagal mengambil data dari server cloud')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Manajemen Barang" subtitle="Kelola seluruh data barang dalam inventaris gudang" />
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-4">Kembali ke kode awal. Data berhasil dimuat.</p>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2 border-b dark:border-navy-800">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-navy-800 overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt="img" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase">{item.name.substring(0,2)}</span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold">{item.name}</h4>
                <p className="text-xs text-slate-400">{item.code} • Stok: {item.stock}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}