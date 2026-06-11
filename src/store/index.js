import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

// ===== AUTH STORE =====
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(credentials)
          localStorage.setItem('hm_token', data.token)
          
          // AMAN: Ekstrak data user terdalam jika terbungkus objek 'user' ganda
          const cleanUser = data.user?.user || data.user || data;
          
          set({ user: cleanUser, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login gagal.' }
        }
      },

      // 🌟 FUNGSI BARU: MENYAMBUNGKAN REGISTRASI KE API BACKEND LARAVEL
      register: async (formData) => {
        try {
          const { data } = await authApi.register(formData)
          return { success: true, message: data.message || 'Registrasi akun berhasil!' }
        } catch (err) {
          return { 
            success: false, 
            message: err.response?.data?.message || 'Registrasi akun gagal.',
            errors: err.response?.data?.errors 
          }
        }
      },

      logout: async () => {
        try { await authApi.logout() } catch (_) {}
        localStorage.removeItem('hm_token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me()
          
          // AMAN & FIX: Bongkar bungkusan data dari API Laravel /me agar tidak merusak state role
          const cleanUser = data?.user || data;
          
          set({ user: cleanUser })
        } catch (_) { 
          get().logout() 
        }
      },

      // AMAN: Menjaga fungsi update profile agar tetap sinkron strukturnya
      updateUser: (userData) => {
        const cleanUser = userData?.user || userData;
        set({ user: cleanUser })
      },
      
      isAuthenticated: () => !!get().token,
      hasRole: (role) => get().user?.role === role,
      hasAnyRole: (roles) => roles.includes(get().user?.role),
    }),
    { name: 'hm-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)

// ===== UI STORE =====
export const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  darkMode: localStorage.getItem('hm-dark') === 'true',
  unreadNotifs: 0,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  toggleDark: () => {
    const next = !get().darkMode
    localStorage.setItem('hm-dark', next)
    document.documentElement.classList.toggle('dark', next)
    set({ darkMode: next })
  },

  setUnreadNotifs: (count) => set({ unreadNotifs: count }),
  decrementNotifs: () => set(s => ({ unreadNotifs: Math.max(0, s.unreadNotifs - 1) })),
}))

// ===== DASHBOARD STORE =====
export const useDashboardStore = create((set) => ({
  data: null,
  loading: true,
  error: null,
  setData: (data) => set({ data, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}))