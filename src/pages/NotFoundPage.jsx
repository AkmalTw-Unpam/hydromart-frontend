import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 text-center px-6">
      <div className="text-8xl font-black text-primary-200 dark:text-navy-800 select-none mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <Link to="/dashboard" className="btn-primary"><Home size={16} /> Kembali ke Dashboard</Link>
    </div>
  )
}
