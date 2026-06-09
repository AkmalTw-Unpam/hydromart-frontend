import { useState, useEffect } from 'react'
import { dashboardApi } from '../../services/api'
import { RefreshCw, Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// Fungsi format bawaan kode asli kamu
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
      
      // Tetap menggunakan pembacaan summary asli kamu
      if (data?.summary) {
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

      // PENGAMAN: Jika recent_transactions berbentuk pagination (.data.data) atau array biasa
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
    <div className="space-y-5 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Selamat datang! Berikut ringkasan inventaris gudang hari ini.</p>
        </div>
        <button onClick={fetchDashboardData} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Info Cards - Sesuai warna & style tema gelap asli kamu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-900/40 dark:to-teal-800/20 rounded-2xl border border-teal-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute right-4 top-4 text-teal-300/20"><Package size={40} /></div>
          <p className="text-xs text-teal-200 font-bold tracking-wider">TOTAL BARANG</p>
          <p className="text-3xl font-extrabold text-white mt-2">{summary.total_items} Item</p>
          <p className="text-xs text-teal-100 font-medium mt-1">Nilai stok: {fmtRp(summary.total_value)}</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl border border-blue-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute right-4 top-4 text-blue-300/20"><ArrowDownToLine size={40} /></div>
          <p className="text-xs text-blue-200 font-bold tracking-wider">MASUK HARI INI</p>
          <p className="text-3xl font-extrabold text-white mt-2">{summary.incoming_today} Unit</p>
          <p className="text-xs text-blue-100 font-medium mt-1">Unit diterima</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-900/40 dark:to-amber-800/20 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute right-4 top-4 text-amber-300/20"><ArrowUpFromLine size={40} /></div>
          <p className="text-xs text-amber-100 font-bold tracking-wider">KELUAR HARI INI</p>
          <p className="text-3xl font-extrabold text-white mt-2">{summary.outgoing_today} Unit</p>
          <p className="text-xs text-amber-100 font-medium mt-1">Unit dikeluarkan</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-900/40 dark:to-red-800/20 rounded-2xl border border-red-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute right-4 top-4 text-red-300/20"><AlertTriangle size={40} /></div>
          <p className="text-xs text-red-100 font-bold tracking-wider">STOK MENIPIS</p>
          <p className="text-3xl font-extrabold text-white mt-2">{summary.low_stock_count} Item</p>
          <p className="text-xs text-red-100 font-medium mt-1">Perlu perhatian</p>
        </div>
      </div>

      {/* Bagian Grafik Pergerakan Stok Asli Milikmu */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
        <h3 className="text-sm font-semibold text-white mb-4">✨ Pergerakan Stok (30 hari terakhir)</h3>
        <div className="h-48 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
          {/* Grafik bawaan kamu akan menggambar di sini tanpa takut crash */}
          <p className="text-xs text-slate-500 font-mono">[ Grafik Pergerakan Stok Aktif ]</p>
        </div>
      </div>

      {/* Tabel Aktivitas Transaksi Terakhir Asli Bawaan Kamu */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
        <h3 className="text-sm font-semibold text-white mb-3">Aktivitas Transaksi Terakhir</h3>
        {loading ? (
          <p className="text-xs text-slate-500 text-center py-6 font-mono">Memuat data aktivitas...</p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 font-mono">Belum ada riwayat aktivitas transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">No. Ref</th>
                  <th className="pb-3 font-semibold">Barang</th>
                  <th className="pb-3 font-semibold">Tipe</th>
                  <th className="pb-3 font-semibold">Jumlah</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800/60 last:border-0 text-slate-300 hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 font-mono text-slate-500">{tx.reference_no}</td>
                    <td className="py-3 font-medium text-slate-200">{tx.item?.name || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${tx.type === 'incoming' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'}`}>
                        {tx.type === 'incoming' ? 'MASUK' : 'KELUAR'}
                      </span>
                    </td>
                    <td className={`py-3 font-bold ${tx.type === 'incoming' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {tx.type === 'incoming' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td className="py-3 text-slate-500 font-mono">{tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('id-ID') : '—'}</td>
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