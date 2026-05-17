import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
})

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 419) {
      await axios.get(
        (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/sanctum/csrf-cookie',
        { withCredentials: true }
      )
      return api.request(error.config)
    }
    return Promise.reject(error)
  }
)

export default api
