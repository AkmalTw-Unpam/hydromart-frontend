import { NavLink, useNavigate } from 'react-router-dom'
import { useUIStore, useAuthStore } from '../../store'
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  Truck, Tag, FileBarChart, ChevronLeft, ChevronRight, Droplets, X, LogOut
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
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    if (window.innerWidth < 768) {
      toggleSidebar() // Tutup sidebar dulu di HP biar animasinya bersih
    }
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        'fixed top-0 h-full z-50 flex flex-col transition-all duration-300',
        'bg-white dark:bg-navy-900 border-r border-slate-100 dark:border-navy-800',
        sidebarOpen 
          ? 'w-[260px] left-0' 
          : 'w-[72px] -left-full md:left-0'
      )}
    >
      {/* HEADER LOGO & TOMBOL CLOSE MOBILE */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
            <Droplets size={18} className="text-white" />
          </div>
          <div className={clsx(
            'transition-all duration-300 min-w-0',
            sidebarOpen ? 'opacity-100 visible block' : 'opacity-0 invisible hidden md:hidden'
          )}>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Hydromart</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">Inventory System</p>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="block md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          title="Tutup Menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!sidebarOpen && <div className="h-2 hidden md:block" />}
        {sidebarOpen && (
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-2">
            Menu Utama
          </p>
        )}
        {filtered.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => {
              if (window.innerWidth < 768) {
                toggleSidebar()
              }
            }}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active', !sidebarOpen && 'justify-center px-2')
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className={clsx('truncate transition-opacity duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden')}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER SIDEBAR: TOMBOL LOGOUT KHUSUS HP & TOGGLE COLLAPSE DESKTOP */}
      <div className="border-t border-slate-100 dark:border-navy-800 p-2 md:p-0">
        {/* TOMBOL LOGOUT (Hanya muncul di HP/Mobile view) */}
        <button
          onClick={handleLogout}
          className="flex md:hidden items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>Keluar Aplikasi</span>
        </button>

        {/* Collapse Toggle (Hanya muncul di PC/Desktop view) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center w-full p-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {sidebarOpen
            ? <><ChevronLeft size={16} /><span className="ml-2 text-xs">Ciutkan</span></>
            : <ChevronRight size={16} />}
        </button>
      </div>

    </aside>
  )
}