import { Link } from 'react-router-dom'
import { ArrowRight, Package, Shield, BarChart3, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white overflow-hidden relative">
      
      {/* Background Decorative Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/hui-logo.png" className="h-9 w-auto object-contain rounded-xl" alt="HUI Logo" />
          <div>
            <p className="font-bold text-base text-slate-900 dark:text-white leading-tight">Hydromart</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Warehouse Management</p>
          </div>
        </div>
        <Link to="/login" className="btn-primary btn-sm flex items-center gap-2">
          Masuk ke Sistem <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10 flex flex-col items-center text-center">
        
        {/* Badge Intro */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
          <Zap size={12} /> Next-Gen WMS Platform
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-6">
          Kelola Inventaris Gudang <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-cyan-500 dark:from-cyan-400 dark:to-primary-400">
            Lebih Cerdas & Akurat
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-10">
          Sistem Manajemen Inventaris Gudang terintegrasi milik PT. Hydromart Utama Indonesia. Pantau pergerakan stok barang, mutasi, supplier, dan laporan analitik secara real-time dalam satu dasbor.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/login" className="btn-primary btn-lg px-8 shadow-lg shadow-primary-500/20 flex items-center gap-2 text-base font-semibold">
            Buka Aplikasi Gudang <ArrowRight size={18} />
          </Link>
        </div>

        {/* Feature Grid Brief */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-24">
          <div className="p-6 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700/50 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <Package size={20} />
            </div>
            <h3 className="font-bold text-base mb-1">Pelacakan Real-Time</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Pantau jumlah stok minimum, penyesuaian opname, dan lokasi rak barang secara instan.</p>
          </div>

          <div className="p-6 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700/50 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-base mb-1">Analitik & Mutasi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Pencatatan otomatis barang masuk dan keluar lengkap dengan grafik tren performa gudang.</p>
          </div>

          <div className="p-6 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700/50 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-base mb-1">Hak Akses Ketat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Proteksi keamanan data berlapis berdasarkan peran Admin, Manager, dan Operator.</p>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-navy-800 absolute bottom-0 left-0">
        © 2026 PT. Hydromart Utama Indonesia. All rights reserved.
      </footer>
    </div>
  )
}