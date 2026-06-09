import { useState, useEffect, useCallback } from 'react'
import { transactionsApi, itemsApi, suppliersApi } from '../../services/api'
import { Modal, PageHeader, TableSkeleton, Pagination, EmptyState, FormField, SearchInput } from '../../components/ui'
import { Plus, ArrowDownToLine, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
  item_id: '', supplier_id: '', quantity: '', price_per_unit: '',
  transaction_date: new Date().toISOString().split('T')[0],
  invoice_no: '', notes: ''
}

export default function IncomingPage() {
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
  const [suppliers, setSuppliers] = useState([])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await transactionsApi.incomingList({ search, page, per_page: 15, date_from: dateFrom, date_to: dateTo })
      
      if (data && data.data) {
        setRows(Array.isArray(data.data) ? data.data : Array.isArray(data.data.data) ? data.data.data : [])
      } else if (Array.isArray(data)) {
        setRows(data)
      } else {
        setRows([])
      }
      
      setMeta(data?.meta || null)
    } catch (_) {
      toast.error('Gagal memuat riwayat transaksi masuk.')
    }
    setLoading(false)
  }, [search, page, dateFrom, dateTo])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    itemsApi.list({ per_page: 999, is_active: true }).then(r => {
      const resData = r.data
      setItems(resData?.data && Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : [])
    }).catch(err => console.error(err))

    suppliersApi.list({ per_page: 999 }).then(r => {
      const resData = r.data
      setSuppliers(resData?.data && Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : [])
    }).catch(err => console.error(err))
  }, [])

  const openCreate = () => { setForm(INITIAL_FORM); setFormErrors({}); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    setFormErrors({})
    try {
      await transactionsApi.incomingCreate(form)
      toast.success('Barang masuk berhasil dicatat. Stok diperbarui.')
      setModalOpen(false)
      fetch()
    } catch (err) {
      if (err.response?.status === 422) setFormErrors(err.response.data.errors || {})
      else toast.error(err.response?.data?.message || 'Gagal menyimpan.')
    }
    setSaving(false)
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const fmtRp = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

  const selectedItem = Array.isArray(items) ? items.find(i => i.id == form.item_id) : null

  return (
    <div className="space-y-5">
      <PageHeader
        title="Barang Masuk"
        subtitle="Catat penerimaan barang dari supplier"
        actions={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> Catat Barang Masuk</button>}
      />

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

      {loading ? <TableSkeleton cols={8} rows={10} /> : (
        <div className="card overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-100 dark:border-navy-800 flex items-center gap-2">
            <ArrowDownToLine size={15} className="text-emerald-500" />
            <span className="font-semibold text-sm text-slate-800 dark:text-white">Riwayat Penerimaan Barang</span>
            {meta && <span className="badge-slate ml-auto">{meta.total} transaksi</span>}
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>No. Ref</th><th>Tanggal</th><th>Barang</th>
                  <th>Supplier</th><th>Jumlah</th><th>Harga/Unit</th>
                  <th>Total Nilai</th><th>Dicatat oleh</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(rows) || rows.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon={ArrowDownToLine} title="Belum ada transaksi masuk" description="Klik tombol 'Catat Barang Masuk' untuk memulai." /></td></tr>
                ) : rows.map(r => (
                  <tr key={r.id}>
                    <td><span className="font-mono text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-lg">{r.reference_no}</span></td>
                    <td className="text-xs">{fmtDate(r.transaction_date)}</td>
                    <td>
                      <p className="font-medium text-sm">{r.item?.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.item?.code}</p>
                    </td>
                    <td className="text-xs">{r.supplier?.name || '—'}</td>
                    <td><span className="font-semibold text-emerald-600">+{r.quantity}</span> <span className="text-xs text-slate-400">{r.item?.unit}</span></td>
                    <td className="text-xs">{fmtRp(r.price_per_unit)}</td>
                    <td className="text-xs font-semibold">{fmtRp(r.total_value)}</td>
                    <td className="text-xs text-slate-500">{r.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination meta={meta} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Catat Barang Masuk"
        size="md"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan & Update Stok'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedItem && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <ArrowDownToLine size={16} className="text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{selectedItem.name}</span>
                <span className="text-emerald-600 ml-2">· Stok saat ini: <strong>{selectedItem.stock} {selectedItem.unit}</strong></span>
              </div>
            </div>
          )}

          <FormField label="Pilih Barang" required error={formErrors?.item_id}>
            <select className="select" value={form.item_id} onChange={e => setForm(p => ({ ...p, item_id: e.target.value }))}>
              <option value="">— Pilih barang —</option>
              {Array.isArray(items) && items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
            </select>
          </FormField>

          <FormField label="Supplier" error={formErrors?.supplier_id}>
            <select className="select" value={form.supplier_id} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))}>
              <option value="">— Pilih supplier —</option>
              {Array.isArray(suppliers) && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Jumlah" required error={formErrors?.quantity}>
              <input type="number" min={0.01} step={0.01} className="input" value={form.quantity}
                onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="0" />
            </FormField>
            <FormField label="Harga/Satuan (Rp)" error={formErrors?.price_per_unit}>
              <input type="number" min={0} className="input" value={form.price_per_unit}
                onChange={e => setForm(p => ({ ...p, price_per_unit: e.target.value }))} placeholder="0" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tanggal Terima" required error={formErrors?.transaction_date}>
              <input type="date" className="input" value={form.transaction_date}
                onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))} />
            </FormField>
            <FormField label="No. Invoice" error={formErrors?.invoice_no}>
              <input className="input" value={form.invoice_no}
                onChange={e => setForm(p => ({ ...p, invoice_no: e.target.value }))} placeholder="INV-..." />
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