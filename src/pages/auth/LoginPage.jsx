import { useState } from 'react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Droplets, ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const [form, setForm] = useState({ email: 'admin@hydromart.id', password: 'password' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (!form.email) { setErrors(p => ({ ...p, email: 'Email wajib diisi.' })); return }
    if (!form.password) { setErrors(p => ({ ...p, password: 'Password wajib diisi.' })); return }

    const result = await login(form)
    if (!result.success) {
      toast.error(result.message || 'Login gagal.')
    }
  }

  const DEMO_ACCOUNTS = [
    { role: 'Admin',   email: 'admin@hydromart.id',   color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
    { role: 'Manager', email: 'manager@hydromart.id', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    { role: 'Staff',   email: 'staff@hydromart.id',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 sm:px-12 bg-white dark:bg-navy-900">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">PT. Hydromart</p>
            <p className="text-xs text-slate-400 leading-tight">Utama Indonesia</p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Selamat datang kembali 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Masuk ke Sistem Manajemen Inventaris Gudang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="input-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="nama@hydromart.id"
                className={`input pl-9 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-300/30' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className={`input pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary btn-lg w-full mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2">Masuk ke Sistem <ArrowRight size={16} /></span>
            )}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-8 p-4 bg-slate-50 dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Akun Demo (password: password)</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(a => (
              <button
                key={a.email}
                type="button"
                onClick={() => setForm({ email: a.email, password: 'password' })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors text-left"
              >
                <span className="text-xs text-slate-600 dark:text-slate-300">{a.email}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.color}`}>{a.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8">
          © 2025 PT. Hydromart Utama Indonesia. All rights reserved.
        </p>
      </div>

      {/* RIGHT — Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-primary-900">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-400/5 rounded-full blur-2xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 w-full">
          {/* Floating cards */}
          <div className="space-y-4 w-full max-w-sm mb-10">
            {[
              { label: 'Total Barang Aktif', value: '248 Item', icon: '📦', color: 'from-primary-500/20 to-primary-600/10 border-primary-500/20' },
              { label: 'Transaksi Hari Ini', value: '34 Transaksi', icon: '📊', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
              { label: 'Stok Menipis',       value: '7 Item', icon: '⚠️', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
            ].map((card, i) => (
              <div
                key={card.label}
                style={{ animationDelay: `${i * 0.15}s` }}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${card.color} border backdrop-blur-sm slide-up`}
              >
                <span className="text-2xl">{card.icon}</span>
                <div className="text-left">
                  <p className="text-xs text-white/60 font-medium">{card.label}</p>
                  <p className="text-lg font-bold text-white">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Kelola Inventaris<br />
            <span className="text-primary-400">Lebih Cerdas & Efisien</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            Sistem manajemen gudang terintegrasi dengan pemantauan stok real-time dan laporan analitik lengkap.
          </p>
        </div>
      </div>
    </div>
  )
}
