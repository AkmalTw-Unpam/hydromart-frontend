import { Outlet } from 'react-router-dom'
import { useUIStore } from '../../store'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import clsx from 'clsx'

export default function AppLayout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1329] transition-colors duration-300">
      {/* 1. SIDEBAR UTAMA */}
      <Sidebar />

      {/* 2. KONTEN UTAMA */}
      {/* Perbaikan Besar: Di HP (default), padding kiri diatur 0 ('pl-0') agar konten penuh semuka layar. */}
      {/* Padding kiri 'md:pl-[260px]' atau 'md:pl-[72px]' hanya akan aktif ketika dibuka di layar besar / PC (md:). */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarOpen ? 'md:pl-[260px]' : 'md:pl-[72px]',
          'pl-0' 
        )}
      >
        {/* BAR ATAS */}
        <Topbar />

        {/* AREA HALAMAN (TEMPAT TABEL BARANG / SUPPLIER) */}
        {/* Di HP padding disesuaikan menjadi p-4 agar lebih proporsional, di PC kembali ke p-6 */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}