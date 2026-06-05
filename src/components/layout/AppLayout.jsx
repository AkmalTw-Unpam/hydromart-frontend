import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore, useUIStore } from '../../store'
import { notificationsApi } from '../../services/api'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const { fetchMe } = useAuthStore()
  const { sidebarOpen, setUnreadNotifs } = useUIStore()

  useEffect(() => {
    fetchMe()
    const fetchNotifCount = async () => {
      try {
        const { data } = await notificationsApi.unreadCount()
        setUnreadNotifs(data.count)
      } catch (_) {}
    }
    fetchNotifCount()
    const interval = setInterval(fetchNotifCount, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-screen-2xl mx-auto animate-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
