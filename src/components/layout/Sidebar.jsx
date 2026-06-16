import { NavLink } from 'react-router-dom'
import { useUIStore, useAuthStore } from '../../store'
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  Truck, Tag, FileBarChart, ChevronLeft, ChevronRight, Droplets
} from 'lucide-react'
import clsx from 'clsx'

// Fungsi pembantu untuk membersihkan string teks
function strtolower(str) {
  return String(str || '').toLowerCase().trim();
}

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: null },
  { to: '/items',     icon: Package,          label: 'Barang',    roles: null },
  { to: '/incoming',  icon: ArrowDownToLine,  label: 'Barang Masuk', roles: null },
  { to: '/outgoing',  icon: ArrowUpFromLine,  label: 'Barang Keluar', roles: null },
  
  // Hak akses menu utama dikunci untuk admin, administrator, dan manager
  { to: '/suppliers', icon: Truck,            label: 'Supplier',  roles: ['admin', 'manager', 'administrator'] },
  { to: '/categories',icon: Tag,              label: 'Kategori',  roles: ['admin', 'manager', 'administrator'] },
  { to: '/reports',   icon: FileBarChart,     label: 'Laporan',   roles: ['admin', 'manager', 'administrator'] },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  // Ambil data user dari semua kemungkinan layer objek store frontend
  const currentUser = user?.user || user?.data || user;
  
  // Ambil data 'role' DAN 'role_label' sebagai cadangan autentikasi
  const userRole = strtolower(currentUser?.role);
  const userRoleLabel = strtolower(currentUser?.role_label);

  // Filter menu: Loloskan jika user memiliki salah satu kriteria role yang cocok
  const filtered = NAV.filter(n => {
    if (!n.roles) return true;
    return n.roles.includes(userRole) || n.roles.includes(userRoleLabel);
  });

  return (
    <aside
      className={clsx(
        'fixed top-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-white dark:bg-navy-900 border-r border-slate-100 dark:border-navy-800',
        
        // PERBAIKAN NAVIGASI HP: 
        // Di PC (md:), sidebarOpen true lebar 260px, false menciut 72px di left-0.
        // Di HP (layar < 768px), jika sidebarOpen true maka bergeser masuk (left-0), jika false maka sembunyi keluar layar (-left-full).
        sidebarOpen 
          ? 'w-[260px] left-0' 
          : 'w-[72px] -left-full md:left-0'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-navy-800">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
          <Droplets size={18} className="text-white" />
        </div>
        {/* Di HP, paksa teks logo muncul saat sidebar terbuka geser */}
        <div className={clsx('min-w-0', sidebarOpen ? 'block' : 'hidden md:block')}>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Hydromart</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">Inventory System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {(!sidebarOpen) && <div className="h-2 hidden md:block" />}
        {(sidebarOpen || window.innerWidth < 768) && (
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-2">
            Menu Utama
          </p>
        )}
        {filtered.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => {
              // DETEKSI HP: Jika diklik di layar HP, otomatis panggil toggleSidebar() untuk menutup menu kembali
              if (window.innerWidth < 768) {
                toggleSidebar()
              }
            }}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active', !sidebarOpen && 'justify-center px-2 md:px-2')
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className={clsx('truncate', sidebarOpen ? 'block' : 'block md:hidden')}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      {/* Tombol ciutkan bawaan ini disembunyikan murni di HP (hidden md:flex) agar tidak merusak fungsionalitas */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex items-center justify-center w-full p-4 border-t border-slate-100 dark:border-navy-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {sidebarOpen
          ? <><ChevronLeft size={16} /><span className="ml-2 text-xs">Ciutkan</span></>
          : <ChevronRight size={16} />}
      </button>
    </aside>
  )
}