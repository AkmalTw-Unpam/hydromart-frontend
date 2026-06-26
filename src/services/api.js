import axios from 'axios' 

const api = axios.create({
  baseURL: 'https://hydromart-backend-production.up.railway.app/api',
  headers: { 'Accept': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('hm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hm_token')
      localStorage.removeItem('hm_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authApi = {
  login:          data => api.post('/login', data),
  register:       data => api.post('/register', data),
  forgotPassword: data => api.post('/forgot-password', data),
  logout:         ()   => api.post('/logout'),
  me:             ()   => api.get('/me'),
  updateProfile:  data => api.post('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: data => api.post('/change-password', data),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const itemsApi = {
  list:   params => api.get('/items', { params }),
  create: data   => api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  get:    id     => api.get(`/items/${id}`),
  update: (id, data) => api.post(`/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: id     => api.post(`/items/${id}/delete`), // GANTI KE POST
  adjust: (id, data) => api.post(`/items/${id}/adjust`, data),
}

export const categoriesApi = {
  list:   params => api.get('/categories', { params }),
  create: data   => api.post('/categories', data),
  update: (id, data) => api.post(`/categories/${id}`, data),
  delete: id     => api.post(`/categories/${id}/delete`), // GANTI KE POST
}

export const suppliersApi = {
  list:   params => api.get('/suppliers', { params }),
  create: data   => api.post('/suppliers', data),
  get:    id     => api.get(`/suppliers/${id}`),
  update: (id, data) => api.post(`/suppliers/${id}`, data), // POST MURNI
  delete: id     => api.post(`/suppliers/${id}/delete`),    // POST MURNI
}

export const transactionsApi = {
  incomingList:   params => api.get('/incoming', { params }),
  incomingCreate: data  => api.post('/incoming', data),
  outgoingList:   params => api.get('/outgoing', { params }),
  outgoingCreate: data  => api.post('/outgoing', data),
}

export const notificationsApi = {
  list:        params => api.get('/notifications', { params }),
  unreadCount: ()   => api.get('/notifications/unread-count'),
  markRead:    ids  => api.post('/notifications/read', { ids }),
  markAllRead: ()   => api.post('/notifications/read-all'),
}

export const reportsApi = {
  stock:     params => api.get('/reports/stock', { params }),
  incoming:  params => api.get('/reports/incoming', { params }),
  outgoing:  params => api.get('/reports/outgoing', { params }),
  movements: params => api.get('/reports/movements', { params }),
}