import { useState, useEffect } from 'react'
import { itemsApi, categoriesApi } from '../../services/api'
import { PageHeader } from '../../components/ui'
import { Plus, Edit2, Trash2, Sliders, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  // State untuk filter dan pencarian
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // State untuk Modal Penyesuaian Stok (Adjustment)
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [newStockValue, setNewStockValue] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [saving, setSaving] = useState(false)

  // Ambil data barang dari API Laragon
  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {
        search: search || undefined,
        category_id: selectedCategory || undefined
      }
      const { data } = await itemsApi.list(params)
      setItems(data.data || data)
    } catch (err) {
      toast.error('Gagal memuat data barang.')
    }
    setLoading(false)
  }

  // Ambil data kategori untuk filter dropdown
  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.list()
      setCategories(data.data || data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [selectedCategory])

  // Membuka modal penyesuaian stok
  const openAdjustModal = (item) => {
    setSelectedItem(item)
    setNewStockValue(item.stock)
    setAdjustmentReason('')
    setIsAdjustOpen(true)
  }

  // JALUR FIX AMAN: Mengirimkan field 'notes' sesuai permintaan Laravel
  const handleAdjustSubmit = async (e) => {
    e.preventDefault()
    if (!adjustmentReason.trim()) {
      toast.error('Alasan penyesuaian wajib diisi!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        stock: parseFloat(newStockValue),
        notes: adjustmentReason // <-- Kunci perbaikan utama Laravel Anda!
      }

      await itemsApi.adjust(selectedItem.id, payload)
      toast.success(`Stok ${selectedItem.name} berhasil diperbarui.`)
      setIsAdjustOpen(false)
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyesuaikan stok.')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <PageHeader title="Manajemen Barang" subtitle="Kelola seluruh data barang dalam inventaris gudang" />
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-1 gap-3 max-w-xl">
          <input 
            type="text" 
            className="input" 
            placeholder="Cari nama atau kode barang..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchItems()}
          />
          <select 
            className="input max-w-[200px]"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button onClick={fetchItems} className="btn-secondary p-2.5" title="Refresh Data">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table Data Barang */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Barang</th>
              <th>Kategori</th>
              <th>Supplier</th>
              <th>Stok</th>
              <th>Harga</th>
              <th>Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">Memuat data barang...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">Tidak ada data barang ditemukan.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.code}</div>
                  </td>
                  <td><span className="badge-blue">{item.category?.name || '-'}</span></td>
                  <td className="text-sm text-slate-600 dark:text-slate-300">{item.supplier?.name || '-'}</td>
                  <td className="font-bold text-slate-800 dark:text-slate-200">{item.stock} {item.unit || 'Pcs'}</td>
                  <td>Rp {parseInt(item.price).toLocaleString('id-ID')}</td>
                  <td>
                    <span className={item.stock > item.min_stock ? 'badge-green' : 'badge-red'}>
                      {item.stock > item.min_stock ? 'Normal' : 'Stok Menipis'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openAdjustModal(item)} className="p-1.5 text-slate-500 hover:text-primary-500" title="Sesuaikan Stok">
                        <Sliders size={16} />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-amber-500" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-red-500" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Penyesuaian Stok (Adjustment) */}
      {isAdjustOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 relative space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sesuaikan Stok: {selectedItem.name}
            </h3>
            
            <div className="p-3 bg-slate-50 dark:bg-navy-800 rounded-xl text-sm">
              Stok saat ini: <span className="font-bold">{selectedItem.stock} {selectedItem.unit || 'Pcs'}</span>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="label">Stok Baru <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  className="input" 
                  required 
                  value={newStockValue}
                  onChange={e => setNewStockValue(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Alasan Penyesuaian <span className="text-red-500">*</span></label>
                <textarea 
                  className="input min-h-[80px] py-2" 
                  required
                  placeholder="Contoh: Hasil stock opname gudang..."
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAdjustOpen(false)} className="btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}