import { useEffect, useState } from 'react'
import { dashboardApi } from '../../services/api'
import { StatCard, Skeleton, StockBadge } from '../../components/ui'
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, TrendingUp, Activity, Clock } from 'lucide-react'
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
    <div className="bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-700 rounded-xl px-3 py-2 text-xs shadow-xl">
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
    <div className="space-y-6 bg-slate-50 dark:bg-[#0b1329] min-h-screen transition-colors duration-300">
      
      {/* 🌟 HEADER DASHBOARD (Dibuat lebih modern & informatif) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Monitor</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ringkasan data dan pergerakan mutasi barang gudang real-time.</p>
        </div>
        {!loading && (
          <div className="text-[11px] font-medium text-slate-400 bg-white dark:bg-navy-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm self-start md:self-auto">
            Status Sistem: <span className="text-emerald-500 font-semibold">● Terhubung ke Backend</span>
          </div>
        )}
      </div>

      {/* 🌟 STAT CARDS GRID (Symmetry Layout, rapi di HP & Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total Barang" value={fmtNum(stats?.total_items)}
              icon={Package} gradient="grad-teal"
              sub={`Nilai: ${fmtRp(stats?.total_stock_value)}`} />
            <StatCard label="Masuk Hari Ini" value={fmtNum(stats?.in_today)}
              icon={ArrowDownToLine} gradient="grad-blue" sub="Unit diterima" />
            <StatCard label="Keluar Hari Ini" value={fmtNum(stats?.out_today)}
              icon={ArrowUpFromLine} gradient="grad-amber" sub="Unit keluar" />
            <StatCard label="Stok Menipis" value={stats?.low_stock_count || 0}
              icon={AlertTriangle} gradient="grad-red" sub="Perlu perhatian" />
          </>
        )}
      </div>

      {/* 🌟 CHARTS ROW (Grafik Pergerakan Stok + Barang Paling Aktif) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Pergerakan Stok */}
        <div className="xl:col-span-2 bg-white dark:bg-[#111c44] border border-slate-200/60 dark:border-navy-700/50 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-primary-500" /> Pergerakan Stok
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">30 hari terakhir</p>
            </div>
          </div>
          {loading ? <Skeleton className="h-56 rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.chart_data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0abfbc" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0abfbc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="incoming" name="Masuk" stroke="#0abfbc" strokeWidth={2} fill="url(#gIn)" dot={false} />
                <Area type="monotone" dataKey="outgoing" name="Keluar" stroke="#f59e0b" strokeWidth={2} fill="url(#gOut)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Barang Paling Aktif */}
        <div className="bg-white dark:bg-[#111c44] border border-slate-200/60 dark:border-navy-700/50 rounded-xl p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-500" /> Barang Paling Aktif
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan volume keluar</p>
          </div>
          {loading ? <Skeleton className="h-56 rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.top_items} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_out" name="Keluar (30hr)" fill="#0abfbc" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 🌟 BOTTOM ROW (Stok Menipis & Aktivitas Terbaru Terbaca Akurat) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* KARTU: STOK MENIPIS */}
        <div className="bg-white dark:bg-[#111c44] border border-slate-200/60 dark:border-navy-700/50 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-navy-700/50 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Peringatan Stok Menipis</h3>
          </div>
          {loading ? <Skeleton className="h-48 m-4 rounded-lg" /> : (
            <div className="divide-y divide-slate-100 dark:divide-navy-700/40">
              {(data?.low_stock_items || []).length === 0 ? (
                <div className="px-6 py-12 text-center text-xs text-slate-400">Semua stok dalam kondisi aman ✓</div>
              ) : data.low_stock_items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-navy-800/30 transition-colors">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.code}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StockBadge status={item.status} />
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.stock}/{item.min_stock} {item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KARTU: AKTIVITAS TERBARU */}
        <div className="bg-white dark:bg-[#111c44] border border-slate-200/60 dark:border-navy-700/50 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-navy-700/50 flex items-center gap-2">
            <Clock size={16} className="text-sky-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Log Aktivitas Terbaru</h3>
          </div>
          {loading ? <Skeleton className="h-48 m-4 rounded-lg" /> : (
            <div className="divide-y divide-slate-100 dark:divide-navy-700/40 max-h-72 overflow-y-auto">
              {(data?.recent_movements || []).length === 0 ? (
                <div className="px-6 py-12 text-center text-xs text-slate-400">Belum ada log pergerakan barang baru.</div>
              ) : data.recent_movements.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-navy-800/30 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    m.type === 'in' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    m.type === 'out' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                    {m.type === 'in'
                      ? <ArrowDownToLine size={14} />
                      : m.type === 'out'
                      ? <ArrowUpFromLine size={14} />
                      : <Activity size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{m.item?.name || 'Nama barang tidak terbaca'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      <span className="text-sky-500 dark:text-cyan-400">{m.user?.name || 'Sistem'}</span> · {m.quantity} {m.item?.unit || 'Unit'}
                    </p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${m.type === 'in' ? 'text-emerald-500' : m.type === 'out' ? 'text-amber-500' : 'text-blue-500'}`}>
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