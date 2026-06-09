import { useState, useEffect } from 'react'
import { dashboardApi } from '../../services/api'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

function fmtRp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID') }

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    total_items: 0,
    total_value: 0,
    incoming_today: 0,
    outgoing_today: 0,
    low_stock_count: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data } = await dashboardApi.getSummary()
      
      // Mengamankan data summary dari format cloud Railway
      if (data && data.summary) {
        setSummary(data.summary)
      } else if (data) {
        setSummary({
          total_items: data.total_items ?? 0,
          total_value: data.total_value ?? 0,
          incoming_today: data.incoming_today ?? 0,
          outgoing_today: data.outgoing_today ?? 0,
          low_stock_count: data.low_stock_count ?? 0
        })
      }

      // Mengamankan data transaksi terakhir dari pagination cloud
      const txData = data?.recent_transactions?.data || data?.recent_transactions || []
      setRecentTransactions(Array.isArray(txData) ? txData : [])

    } catch (err) {
      toast.error('Gagal memuat ringkasan dashboard.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500">Selamat datang! Berikut ringkasan inventaris gudang hari ini.</p>
        </div>
        <button onClick={fetchDashboardData} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 rounded-xl transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm">
          <p className="text-xs text-slate-400 font-bold">TOTAL BARANG</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{summary.total_items}</p>
          <p className="text-xs text-teal-600 font-medium mt-1">{fmtRp(summary.total_value)}</p>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm">
          <p className="text-xs text-slate-400 font-bold">MASUK HARI INI</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{summary.incoming_today} Unit</p>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm">
          <p className="text-xs text-slate-400 font-bold">KELUAR HARI INI</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{summary.outgoing_today} Unit</p>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm">
          <p className="text-xs text-slate-400 font-bold">STOK MENIPIS</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{summary.low_stock_count} Item</p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Aktivitas Transaksi Terakhir</h3>
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Memuat data...</p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat aktivitas transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-navy-800">
                  <th className="pb-2 font-semibold">No. Ref</th>
                  <th className="pb-2 font-semibold">Barang</th>
                  <th className="pb-2 font-semibold">Tipe</th>
                  <th className="pb-2 font-semibold">Jumlah</th>
                  <th className="pb-2 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50 dark:border-navy-850 last:border-0 text-slate-600 dark:text-slate-300">
                    <td className="py-2.5 font-mono text-slate-400">{tx.reference_no}</td>
                    <td className="py-2.5 font-medium">{tx.item?.name || '—'}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${tx.type === 'incoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {tx.type === 'incoming' ? 'MASUK' : 'KELUAR'}
                      </span>
                    </td>
                    <td className={`py-2.5 font-bold ${tx.type === 'incoming' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {tx.type === 'incoming' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td className="py-2.5 text-slate-400">{new Date(tx.transaction_date).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}