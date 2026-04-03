import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Applications API
export const applicationsApi = {
  getAll: () => api.get('/applications'),
  getOne: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  export: (id) => api.get(`/applications/${id}/export`)
}

// Documents API
export const documentsApi = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getForApplication: (appId) => api.get(`/applications/${appId}/documents`)
}

// Appointments API
export const appointmentsApi = {
  book: (data) => api.post('/appointments/book', data),
  getLocations: () => api.get('/psk/locations')
}

export default api
