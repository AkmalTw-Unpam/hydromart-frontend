import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore, useUIStore } from './store'

import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ItemsPage from './pages/items/ItemsPage'
import IncomingPage from './pages/transactions/IncomingPage'
import OutgoingPage from './pages/transactions/OutgoingPage'
import SuppliersPage from './pages/suppliers/SuppliersPage'
import CategoriesPage from './pages/categories/CategoriesPage'
import ReportsPage from './pages/reports/ReportsPage'
import ProfilePage from './pages/auth/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { darkMode } = useUIStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
          success: { iconTheme: { primary: '#0abfbc', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="items"       element={<ItemsPage />} />
          <Route path="incoming"    element={<IncomingPage />} />
          <Route path="outgoing"    element={<OutgoingPage />} />
          <Route path="suppliers"   element={<SuppliersPage />} />
          <Route path="categories"  element={<CategoriesPage />} />
          <Route path="reports"     element={<ReportsPage />} />
          <Route path="profile"     element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
