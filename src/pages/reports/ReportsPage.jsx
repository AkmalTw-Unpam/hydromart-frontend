import { useState, useEffect } from 'react'
import { reportsApi, categoriesApi, suppliersApi } from '../../services/api'
import { PageHeader, StockBadge, Skeleton } from '../../components/ui'
import { FileBarChart, Download, TrendingDown, TrendingUp, Package, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'stock', label: 'Stok Gudang', icon: Package },
  { id: 'incoming', label: 'Barang Masuk', icon: TrendingDown },
  { id: 'outgoing', label: 'Barang Keluar', icon: TrendingUp },
]

function fmtRp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID') }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }

function exportCSV(data, filename) {
  if (!data || !data.length) { toast.error('Tidak ada data untuk diekspor.'); return }
  const keys = Object.keys(data[0])
  const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
  toast.success('Data berhasil diekspor!')
}

export default function ReportsPage() {
  const [tab, setTab] = useState('stock')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [filters, setFilters] = useState({ date_from: '', date_to: '', category_id: '', supplier_id: '', search: '' })

  // Ambil data kategori & supplier dengan pengaman objek cloud
  useEffect(() => {
    categoriesApi.list().then(r => {
      const resData = r.data
      setCategories(resData?.data && Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : [])
    }).catch(err => console.error(err))

    suppliersApi.list({ per_page: 999 }).then(r => {
      const resData = r.data
      setSuppliers(resData?.data && Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : [])
    }).catch(err => console.error(err))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      if (tab === 'stock') {
        const { data: d } = await reportsApi.stock(filters)
        // Pengaman ekstra jika items dibungkus objek pagination
        const itemsData = d?.items?.data || d?.items || []
        setData(Array.isArray(itemsData) ? itemsData : [])
        setSummary(d?.summary || null)
      } else if (tab === 'incoming') {
        const { data: d } = await reportsApi.incoming(filters)
        const incomingData = d?.transactions?.data || d?.transactions || []
        setData(Array.isArray(incomingData) ? incomingData : [])
        setSummary(d?.summary || null)
      } else {
        const { data: d } = await reportsApi.outgoing(filters)
        const outgoingData = d?.transactions?.data || d?.transactions || []
        setData(Array.isArray(outgoingData) ? outgoingData : [])
        setSummary(d?.summary || null)
      }
    } catch (_) { toast.error('Gagal memuat laporan.') }
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const handleExport = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.error('Tidak ada data untuk diekspor.')
      return
    }
    if (tab === 'stock') {
      exportCSV(data.map(i => ({ Kode: i.code, Nama: i.name, Kategori: i.category?.name, Stok: i.stock, 'Min Stok': i.min_stock, Satuan: i.unit, Lokasi: i.location, Harga: i.price, 'Nilai Total': i.stock * i.price })), `laporan_stok_${new Date().toISOString().split('T')[0]}.csv`)
    } else if (tab === 'incoming') {
      exportCSV(data.map(r => ({ 'No Ref': r.reference_no, Tanggal: fmtDate(r.transaction_date), Barang: r.item?.name, Kode: r.item?.code, Supplier: r.supplier?.name, Jumlah: r.quantity, Satuan: r.item?.unit, 'Harga/unit': r.price_per_unit, Total: r.total_value, Pencatat: r.user?.name })), `laporan_masuk_${new Date().toISOString().split('T')[0]}.csv`)
    } else {
      exportCSV(data.map(r => ({ 'No Ref': r.reference_no, Tanggal: fmtDate(r.transaction_date), Barang: r.item?.name, Kode: r.item?.code, Jumlah: r.quantity, Satuan: r.item?.unit, Tujuan: r.destination, Keperluan: r.purpose, Pencatat: r.user?.name })), `laporan_keluar_${new Date().toISOString().split('T')[0]}.csv`)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan Inventaris"
        subtitle="Analisis dan ekspor data inventaris gudang"
        actions={
          <button onClick={handleExport} className="btn-outline">
            <Download size={15} /> Ekspor CSV
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setData(null); setSummary(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'}`}
            >
              <Icon size={15} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {(tab === 'incoming' || tab === 'outgoing') && (
            <>
              <div>
                <label className="input-label">Dari Tanggal</label>
                <input type="date" className="input w-36" value={filters.date_from} onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Sampai Tanggal</label>
                <input type="date" className="input w-36" value={filters.date_to} onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))} />
              </div>
            </>
          )}
          <div>
            <label className="input-label">Kategori</label>
            <select className="select w-44" value={filters.category_id} onChange={e => setFilters(p => ({ ...p, category_id: e.target.value }))}>
              <option value="">Semua Kategori</option>
              {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {tab === 'incoming' && (
            <div>
              <label className="input-label">Supplier</label>
              <select className="select w-44" value={filters.supplier_id} onChange={e => setFilters(p => ({ ...p, supplier_id: e.target.value }))}>
                <option value="">Semua Supplier</option>
                {Array.isArray(suppliers) && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <button onClick={load} className="btn-primary flex items-center gap-2">
            <RefreshCw size={15} /> Tampilkan
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tab === 'stock' && <>
            <div className="card p-4"><p className="input-label">Total Item</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total_items}</p></div>
            <div className="card p-4"><p className="input-label">Stok Menipis</p><p className="text-2xl font-bold text-amber-500">{summary.low_stock}</p></div>
            <div className="card p-4"><p className="input-label">Stok Habis</p><p className="text-2xl font-bold text-red-500">{summary.empty_stock}</p></div>
            <div className="card p-4"><p className="input-label">Nilai Total Stok</p><p className="text-lg font-bold text-primary-600">{fmtRp(summary.total_stock_value)}</p></div>
          </>}
          {(tab === 'incoming' || tab === 'outgoing') && <>
            <div className="card p-4"><p className="input-label">Total Transaksi</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total_transactions}</p></div>
            <div className="card p-4"><p className="input-label">Total Kuantitas</p><p className="text-2xl font-bold text-primary-600">{Number(summary.total_quantity).toLocaleString('id-ID')}</p></div>
            {tab === 'incoming' && <div className="card p-4 col-span-2"><p className="input-label">Total Nilai</p><p className="text-xl font-bold text-emerald-600">{fmtRp(summary.total_value)}</p></div>}
          </>}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !data || !Array.isArray(data) ? (
          <div className="p-12 text-center text-sm text-slate-400">Klik "Tampilkan" untuk memuat laporan.</div>
        ) : (
          <div className="table-wrapper">
            {tab === 'stock' && (
              <table className="table">
                <thead><tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Stok</th><th>Min. Stok</th><th>Satuan</th><th>Lokasi</th><th>Harga</th><th>Nilai Stok</th><th>Status</th></tr></thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-8 text-slate-400 text-sm">Tidak ada data</td></tr>
                  ) : data.map(i => (
                    <tr key={i.id}>
                      <td><span className="font-mono text-xs badge-slate">{i.code}</span></td>
                      <td className="font-medium text-sm">{i.name}</td>
                      <td><span className="badge text-xs" style={{ background: i.category?.color + '22', color: i.category?.color }}>{i.category?.name}</span></td>
                      <td className={`font-semibold ${i.stock <= i.min_stock ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>{i.stock}</td>
                      <td className="text-xs text-slate-500">{i.min_stock}</td>
                      <td className="text-xs">{i.unit}</td>
                      <td className="text-xs text-slate-500">{i.location || '—'}</td>
                      <td className="text-xs">{fmtRp(i.price)}</td>
                      <td className="text-xs font-semibold">{fmtRp(i.stock * i.price)}</td>
                      <td><StockBadge status={i.stock <= 0 ? 'empty' : i.stock <= i.min_stock ? 'low' : 'normal'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'incoming' && (
              <table className="table">
                <thead><tr><th>No. Ref</th><th>Tanggal</th><th>Barang</th><th>Supplier</th><th>Jumlah</th><th>Harga/Unit</th><th>Total Nilai</th><th>Pencatat</th></tr></thead>
                <tbody>
                  {data.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">Tidak ada data</td></tr>
                  : data.map(r => (
                    <tr key={r.id}>
                      <td><span className="font-mono text-xs badge-green">{r.reference_no}</span></td>
                      <td className="text-xs">{fmtDate(r.transaction_date)}</td>
                      <td><p className="font-medium text-sm">{r.item?.name}</p><p className="text-xs text-slate-400">{r.item?.code}</p></td>
                      <td className="text-xs">{r.supplier?.name || '—'}</td>
                      <td><span className="font-semibold text-emerald-600">+{r.quantity}</span> <span className="text-xs text-slate-400">{r.item?.unit}</span></td>
                      <td className="text-xs">{fmtRp(r.price_per_unit)}</td>
                      <td className="text-xs font-semibold">{fmtRp(r.total_value)}</td>
                      <td className="text-xs text-slate-500">{r.user?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'outgoing' && (
              <table className="table">
                <thead><tr><th>No. Ref</th><th>Tanggal</th><th>Barang</th><th>Jumlah</th><th>Tujuan</th><th>Keperluan</th><th>Pencatat</th></tr></thead>
                <tbody>
                  {data.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-sm">Tidak ada data</td></tr>
                  : data.map(r => (
                    <tr key={r.id}>
                      <td><span className="font-mono text-xs badge-amber">{r.reference_no}</span></td>
                      <td className="text-xs">{fmtDate(r.transaction_date)}</td>
                      <td><p className="font-medium text-sm">{r.item?.name}</p><p className="text-xs text-slate-400">{r.item?.code}</p></td>
                      <td><span className="font-semibold text-amber-600">-{r.quantity}</span> <span className="text-xs text-slate-400">{r.item?.unit}</span></td>
                      <td className="text-xs">{r.destination}</td>
                      <td className="text-xs text-slate-500">{r.purpose || '—'}</td>
                      <td className="text-xs text-slate-500">{r.user?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}