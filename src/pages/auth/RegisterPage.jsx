import { useState } from 'react'
import { useAuthStore } from '../../store' // 🌟 Path disesuaikan karena sekarang ada di dalam folder auth
import toast from 'react-hot-toast'
import { Droplets, ArrowRight, Lock, Mail, User } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const result = await register(form)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      window.location.href = '/login'
    } else {
      if (result.errors) setErrors(result.errors)
      else toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-navy-800 p-8 rounded-2xl shadow-md border border-slate-100 dark:border-navy-700">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Droplets size={20} className="text-white" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white text-lg">PT. Hydromart</p>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Daftar Akun Baru</h1>
        <p className="text-sm text-center text-slate-500 mb-6">Mulai kelola inventaris gudang kamu sekarang</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Lengkap</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input pl-9" placeholder="Nama lengkap Anda" />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="input-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input pl-9" placeholder="nama@hydromart.id" />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input pl-9" placeholder="••••••••" />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2">
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-6">
          Sudah punya akun? <a href="/login" className="font-semibold text-primary-500">Login di sini</a>
        </p>
      </div>
    </div>
  )
}