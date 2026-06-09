import { useEffect, useState } from 'react'
import { dashboardApi } from '../../services/api'
import { StatCard, Skeleton, StockBadge } from '../../components/ui'
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'Jt'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n?.toFixed ? n.toFixed(0) : n
}

function fmtRp(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID')
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.get()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Selamat datang! Berikut ringkasan inventaris gudang hari ini.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Total Barang" value={fmtNum(stats?.total_items)}
              icon={Package} gradient="grad-teal"
              sub={`Nilai stok: ${fmtRp(stats?.total_stock_value)}`} />
            <StatCard label="Masuk Hari Ini" value={fmtNum(stats?.in_today)}
              icon={ArrowDownToLine} gradient="grad-blue" sub="Unit diterima" />
            <StatCard label="Keluar Hari Ini" value={fmtNum(stats?.out_today)}
              icon={ArrowUpFromLine} gradient="grad-amber" sub="Unit dikeluarkan" />
            <StatCard label="Stok Menipis" value={stats?.low_stock_count}
              icon={AlertTriangle} gradient="grad-red" sub="Perlu perhatian" />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Movement Chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-primary-500" /> Pergerakan Stok
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">30 hari terakhir</p>
            </div>
          </div>
          {loading ? <Skeleton className="h-56" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.chart_data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0abfbc" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0abfbc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="incoming" name="Masuk" stroke="#0abfbc" strokeWidth={2} fill="url(#gIn)" dot={false} />
                <Area type="monotone" dataKey="outgoing" name="Keluar" stroke="#f59e0b" strokeWidth={2} fill="url(#gOut)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Items */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-primary-500" /> Barang Paling Aktif
          </h3>
          {loading ? <Skeleton className="h-56" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.top_items} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_out" name="Keluar (30hr)" fill="#0abfbc" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-navy-800">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Stok Menipis
            </h3>
          </div>
          {loading ? <Skeleton className="h-48 m-4" /> : (
            <div className="divide-y divide-slate-50 dark:divide-navy-800">
              {(data?.low_stock_items || []).length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">Semua stok dalam kondisi aman ✓</div>
              ) : data.low_stock_items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-navy-800/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.code}</p>
                  </div>
                  <div className="text-right">
                    <StockBadge status={item.status} />
                    <p className="text-xs text-slate-400 mt-1">{item.stock}/{item.min_stock} {item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-navy-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h3>
          </div>
          {loading ? <Skeleton className="h-48 m-4" /> : (
            <div className="divide-y divide-slate-50 dark:divide-navy-800 max-h-72 overflow-y-auto">
              {(data?.recent_movements || []).map(m => (
                <div key={m.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50/50 dark:hover:bg-navy-800/30 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    m.type === 'out' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {m.type === 'in'
                      ? <ArrowDownToLine size={13} className="text-emerald-600 dark:text-emerald-400" />
                      : m.type === 'out'
                      ? <ArrowUpFromLine size={13} className="text-amber-600 dark:text-amber-400" />
                      : <Activity size={13} className="text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{m.item?.name}</p>
                    <p className="text-xs text-slate-400">{m.user?.name} · {m.quantity} unit</p>
                  </div>
                  <span className={`text-xs font-semibold ${m.type === 'in' ? 'text-emerald-600' : m.type === 'out' ? 'text-amber-600' : 'text-blue-600'}`}>
                    {m.type === 'in' ? '+' : m.type === 'out' ? '-' : '~'}{m.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
