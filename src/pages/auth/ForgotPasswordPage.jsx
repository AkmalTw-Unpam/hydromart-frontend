import React, { useState } from 'react'
import { useAuthStore } from '../../store'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { KeyRound, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const result = await forgotPassword(form)
      
      if (result && result.success) {
        toast.success(result.message || 'Password berhasil diperbarui!')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        setLoading(false)
        if (result && result.errors) {
          setErrors(result.errors)
        } else {
          toast.error(result?.message || 'Gagal mereset password.')
        }
      }
    } catch (error) {
      setLoading(false)
      toast.error('Terjadi kesalahan jaringan sistem.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4 font-sans antialiased">
      <div className="w-full max-w-md bg-white dark:bg-navy-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-navy-700">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-2xl mb-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
          <p className="text-sm text-slate-500 dark:text-navy-300 mt-1 text-center">
            Masukkan email terdaftar dan password baru kamu untuk memulihkan akun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-navy-300 mb-1.5">
              Email Akun
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-navy-400" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="staff@hydromart.id"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border ${
                  errors.email ? 'border-red-500' : 'border-slate-200 dark:border-navy-700'
                } rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
          </div>

          {/* PASSWORD BARU */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-navy-300 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-navy-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-navy-900 border ${
                  errors.password ? 'border-red-500' : 'border-slate-200 dark:border-navy-700'
                } rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-navy-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
          </div>

          {/* KONFIRMASI PASSWORD */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-navy-300 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-navy-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                required
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-700/50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/10"
          >
            {loading ? 'Memproses...' : 'Perbarui Password'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-navy-400">
            Ingat password kembali?{' '}
            <Link to="/login" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
              Login di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}