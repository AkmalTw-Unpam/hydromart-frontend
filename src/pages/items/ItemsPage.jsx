import { useState, useEffect, useCallback } from 'react'
import { itemsApi, categoriesApi, suppliersApi } from '../../services/api'
import { Modal, PageHeader, StockBadge, TableSkeleton, Pagination, EmptyState, ConfirmDialog, FormField, SearchInput } from '../../components/ui'
import { Plus, Pencil, Trash2, Package, SlidersHorizontal, RefreshCw, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import axios from 'axios' // 🌟 PASTIKAN AXIOS SUDAH TERIMPOR DI SINI

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