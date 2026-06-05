import { useState, useEffect, useCallback } from 'react'
import { transactionsApi, itemsApi } from '../../services/api'
import { Modal, PageHeader, TableSkeleton, Pagination, EmptyState, FormField, SearchInput } from '../../components/ui'
import { Plus, ArrowUpFromLine, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
  item_id: '', quantity: '', destination: '', purpose: '',
  transaction_date: new Date().toISOString().split('T')[0],
  requested_by: '', notes: ''
}

const DESTINATIONS = ['Proyek A', 'Proyek B', 'Proyek C', 'Maintenance Rutin', 'Instalasi Baru', 'Workshop', 'Kantor Pusat', 'Lainnya']

export default function OutgoingPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState([])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await transactionsApi.outgoingList({ search, page, per_page: 15, date_from: dateFrom, date_to: dateTo })
      setRows(data.data)
      setMeta(data.meta)
    } catch (_) {}
    setLoading(false)
  }, [search, page, dateFrom, dateTo])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    itemsApi.list({ per_page: 999, is_active: true }).then(r => setItems(r.data.data))
  }, [])

  const openCreate = () => { setForm(INITIAL_FORM); setFormErrors({}); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    setFormErrors({})
    try {
      await transactionsApi.outgoingCreate(form)
      toast.success('Barang keluar berhasil dicatat. Stok diperbarui.')
      setModalOpen(false)
      fetch()
    } catch (err) {
      if (err.response?.status === 422) setFormErrors(err.response.data.errors || {})
      else toast.error(err.response?.data?.message || 'Gagal menyimpan.')
    }
    setSaving(false)
  }

  const selectedItem = items.find(i => i.id == form.item_id)
  const insufficientStock = selectedItem && form.quantity && parseFloat(form.quantity) > parseFloat(selectedItem.stock)

  const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Barang Keluar"
        subtitle="Catat pengeluaran barang dari gudang"
        actions={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> Catat Barang Keluar</button>}
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[180px]">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Cari barang..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="date" className="input w-36 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className="text-slate-400 text-sm">s/d</span>
            <input type="date" className="input w-36 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button onClick={fetch} className="btn-ghost p-2.5 rounded-xl"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton cols={7} rows={10} /> : (
        <div className="card overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-100 dark:border-navy-800 flex items-center gap-2">
            <ArrowUpFromLine size={15} className="text-amber-500" />
            <span className="font-semibold text-sm text-slate-800 dark:text-white">Riwayat Pengeluaran Barang</span>
            {meta && <span className="badge-slate ml-auto">{meta.total} transaksi</span>}
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>No. Ref</th><th>Tanggal</th><th>Barang</th>
                  <th>Jumlah</th><th>Tujuan</th><th>Diminta oleh</th><th>Dicatat oleh</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState icon={ArrowUpFromLine} title="Belum ada transaksi keluar" description="Klik tombol 'Catat Barang Keluar' untuk memulai." /></td></tr>
                ) : rows.map(r => (
                  <tr key={r.id}>
                    <td><span className="font-mono text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg">{r.reference_no}</span></td>
                    <td className="text-xs">{fmtDate(r.transaction_date)}</td>
                    <td>
                      <p className="font-medium text-sm">{r.item?.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.item?.code}</p>
                    </td>
                    <td><span className="font-semibold text-amber-600">-{r.quantity}</span> <span className="text-xs text-slate-400">{r.item?.unit}</span></td>
                    <td className="text-xs">{r.destination}</td>
                    <td className="text-xs text-slate-500">{r.requested_by || '—'}</td>
                    <td className="text-xs text-slate-500">{r.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination meta={meta} onPageChange={setPage} /></div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Catat Barang Keluar"
        size="md"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button onClick={handleSave} disabled={saving || insufficientStock} className="btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan & Update Stok'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedItem && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${insufficientStock ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'}`}>
              {insufficientStock
                ? <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                : <ArrowUpFromLine size={16} className="text-amber-600 flex-shrink-0" />}
              <span className={insufficientStock ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}>
                <strong>{selectedItem.name}</strong> · Stok tersedia: <strong>{selectedItem.stock} {selectedItem.unit}</strong>
                {insufficientStock && <span className="ml-1 text-red-600 font-bold">— Stok tidak cukup!</span>}
              </span>
            </div>
          )}

          <FormField label="Pilih Barang" required error={formErrors?.item_id}>
            <select className="select" value={form.item_id} onChange={e => setForm(p => ({ ...p, item_id: e.target.value }))}>
              <option value="">— Pilih barang —</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code}) · Stok: {i.stock} {i.unit}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Jumlah" required error={formErrors?.quantity}>
              <input type="number" min={0.01} step={0.01} className={`input ${insufficientStock ? 'border-red-400' : ''}`}
                value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
            </FormField>
            <FormField label="Tanggal Keluar" required error={formErrors?.transaction_date}>
              <input type="date" className="input" value={form.transaction_date}
                onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))} />
            </FormField>
          </div>

          <FormField label="Tujuan / Lokasi" required error={formErrors?.destination}>
            <select className="select" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}>
              <option value="">— Pilih tujuan —</option>
              {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Keperluan" error={formErrors?.purpose}>
              <input className="input" value={form.purpose}
                onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} placeholder="Kebutuhan operasional..." />
            </FormField>
            <FormField label="Diminta oleh" error={formErrors?.requested_by}>
              <input className="input" value={form.requested_by}
                onChange={e => setForm(p => ({ ...p, requested_by: e.target.value }))} placeholder="Nama peminta..." />
            </FormField>
          </div>

          <FormField label="Catatan" error={formErrors?.notes}>
            <textarea rows={2} className="textarea" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Keterangan tambahan..." />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
