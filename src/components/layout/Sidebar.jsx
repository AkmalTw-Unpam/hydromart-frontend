import { NavLink } from 'react-router-dom'
import { useUIStore, useAuthStore } from '../../store'
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  Truck, Tag, FileBarChart, ChevronLeft, ChevronRight, Droplets
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: null },
  { to: '/items',     icon: Package,          label: 'Barang',    roles: null },
  { to: '/incoming',  icon: ArrowDownToLine,  label: 'Barang Masuk', roles: null },
  { to: '/outgoing',  icon: ArrowUpFromLine,  label: 'Barang Keluar', roles: null },
  { to: '/suppliers', icon: Truck,            label: 'Supplier',  roles: ['admin','manager'] },
  { to: '/categories',icon: Tag,              label: 'Kategori',  roles: ['admin','manager'] },
  { to: '/reports',   icon: FileBarChart,     label: 'Laporan',   roles: ['admin','manager'] },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  const filtered = NAV.filter(n => !n.roles || n.roles.includes(user?.role))

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-white dark:bg-navy-900 border-r border-slate-100 dark:border-navy-800',
        sidebarOpen ? 'w-[260px]' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-navy-800">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
          <Droplets size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Hydromart</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">Inventory System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!sidebarOpen && <div className="h-2" />}
        {sidebarOpen && (
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-2">
            Menu Utama
          </p>
        )}
        {filtered.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active', !sidebarOpen && 'justify-center px-2')
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center w-full p-4 border-t border-slate-100 dark:border-navy-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {sidebarOpen
          ? <><ChevronLeft size={16} /><span className="ml-2 text-xs">Ciutkan</span></>
          : <ChevronRight size={16} />}
      </button>
    </aside>
  )
}
