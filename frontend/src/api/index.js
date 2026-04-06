import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
          processQueue(new Error('No refresh token'), null)
          window.dispatchEvent(new Event('logout'))
          return Promise.reject(error)
        }

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        })

        const { token: newToken, refreshToken: newRefreshToken } = res.data
        
        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        processQueue(null, newToken)
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.dispatchEvent(new Event('logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data.error || 'Invalid request'
      case 401:
        return 'Session expired. Please login again.'
      case 403:
        return 'Access denied'
      case 404:
        return 'Resource not found'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return data.error || 'An error occurred'
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.'
  } else {
    return 'An unexpected error occurred'
  }
}

export const applicationsApi = {
  getAll: () => api.get('/applications'),
  getOne: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  export: (id) => api.get(`/applications/${id}/export`)
}

export const documentsApi = {
  upload: (applicationId, formData) => api.post(`/documents/${applicationId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getForApplication: (applicationId) => api.get(`/documents/${applicationId}`)
}

export const appointmentsApi = {
  book: (data) => api.post('/appointments', data),
  getLocations: () => api.get('/psk/locations'),
  getSlots: (location) => api.get(`/psk/slots/${location}`)
}

export { handleApiError }
export default api