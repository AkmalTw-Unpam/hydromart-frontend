import axios from 'axios' 

const api = axios.create({
  // Menggunakan IP lokal agar kompatibilitas CORS di Laragon jauh lebih stabil
  baseURL: 'https://hydromart-backend-production.up.railway.app/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
})

// Pasang Token Otomatis ke Setiap Request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('hm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tangani Error Otomatis (Auto-Redirect jika Unauthenticated)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('hm_token')
      localStorage.removeItem('hm_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ===== AUTH API =====
export const authApi = {
  login:          data => api.post('/login', data),
  logout:         ()   => api.post('/logout'),
  me:             ()   => api.get('/me'),
  updateProfile:  data => api.post('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: data => api.post('/change-password', data),
}

// ===== DASHBOARD API =====
export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

// ===== ITEMS API =====
export const itemsApi = {
  list:   params => api.get('/items', { params }),
  create: data   => api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  get:    id     => api.get(`/items/${id}`),
  update: (id, data) => api.post(`/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: id     => api.delete(`/items/${id}`),
  adjust: (id, data) => api.post(`/items/${id}/adjust`, data),
}

// ===== CATEGORIES API =====
export const categoriesApi = {
  list:   params => api.get('/categories', { params }),
  create: data   => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: id     => api.delete(`/categories/${id}`),
}

// ===== SUPPLIERS API =====
export const suppliersApi = {
  list:   params => api.get('/suppliers', { params }),
  create: data   => api.post('/suppliers', data),
  get:    id     => api.get(`/suppliers/${id}`),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: id     => api.delete(`/suppliers/${id}`),
}

// ===== TRANSACTIONS API =====
export const transactionsApi = {
  incomingList:   params => api.get('/incoming', { params }),
  incomingCreate: data  => api.post('/incoming', data),
  outgoingList:   params => api.get('/outgoing', { params }),
  outgoingCreate: data  => api.post('/outgoing', data),
}

// ===== NOTIFICATIONS API (Wajib Ada untuk Topbar.jsx) =====
export const notificationsApi = {
  list:        params => api.get('/notifications', { params }),
  unreadCount: ()   => api.get('/notifications/unread-count'),
  markRead:    ids    => api.post('/notifications/read', { ids }),
  markAllRead: ()   => api.post('/notifications/read-all'),
}

// ===== REPORTS API =====
export const reportsApi = {
  stock:     params => api.get('/reports/stock', { params }),
  incoming:  params => api.get('/reports/incoming', { params }),
  outgoing:  params => api.get('/reports/outgoing', { params }),
  movements: params => api.get('/reports/movements', { params }),
}