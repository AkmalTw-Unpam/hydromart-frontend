import { useState, useRef, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Bell, Sun, Moon, Search, LogOut, User, ChevronDown, Menu, X } from 'lucide-react'
import { useAuthStore, useUIStore } from '../../store'
import { notificationsApi } from '../../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Topbar() {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDark, unreadNotifs, setUnreadNotifs, sidebarOpen, toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [notifs, setNotifs] = useState([])
  const notifRef = useRef(null)
  const userRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadNotifs = async () => {
    try {
      const { data } = await notificationsApi.list({ per_page: 8 })
      setNotifs(data.notifications.data)
      setUnreadNotifs(data.unread_count)
    } catch (_) {}
  }

  const handleBellClick = () => {
    if (!showNotifs) loadNotifs()
    setShowNotifs(v => !v)
    setShowUser(false)
  }

  const markAllRead = async () => {
    await notificationsApi.markAllRead()
    setUnreadNotifs(0)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('Semua notifikasi telah dibaca.')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const ROLE_COLORS = { admin: 'badge-red', manager: 'badge-blue', staff: 'badge-green' }

  return (
    <header className="h-16 flex items-center px-4 md:px-6 gap-3 md:gap-4 bg-white dark:bg-navy-900 border-b border-slate-100 dark:border-navy-800 sticky top-0 z-30">
      
      {/* TOMBOL HAMBURGER MENU (KHUSUS DI HP) */}
      <button 
        onClick={toggleSidebar} 
        className="block md:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
        title="Buka Menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari barang, kode..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rouded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder-slate-400 text-slate-900 dark:text-slate-100 rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <button onClick={toggleDark} className="btn-ghost w-9 h-9 p-0 rounded-xl">
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={handleBellClick} className="btn-ghost w-9 h-9 p-0 rounded-xl relative">
            <Bell size={17} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 card shadow-xl z-50 animate-enter overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-navy-800">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifikasi</span>
                {unreadNotifs > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-50 dark:divide-navy-800 max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">Tidak ada notifikasi</div>
                ) : notifs.map(n => (
                  <div key={n.id} className={clsx('px-4 py-3', !n.is_read && 'bg-primary-50/50 dark:bg-primary-900/10')}>
                    <div className="flex items-start gap-2">
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                      <div className={!n.is_read ? '' : 'ml-4'}>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-navy-800 text-center">
                <NavLink to="/reports" onClick={() => setShowNotifs(false)} className="text-xs text-primary-600 hover:underline font-medium">
                  Lihat semua →
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={window.innerWidth < 640 ? () => navigate('/profile') : () => { setShowUser(v => !v); setShowNotifs(false) }}
            className="flex items-center gap-2 px-1 sm:px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            <img src={user?.avatar_url} alt={user?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
              <p className={clsx('text-[10px] capitalize', ROLE_COLORS[user?.role]?.replace('badge ','')+' rounded-sm')}>{user?.role_label}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-12 w-52 card shadow-xl z-50 animate-enter overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-navy-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <div className="py-1">
                <NavLink
                  to="/profile"
                  onClick={() => setShowUser(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <User size={15} /> Profil Saya
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}