import axios from 'axios'

import { API_BASE_URL } from '../constants'

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(async (config) => {
  let token = ''
  
  if (typeof window !== 'undefined') {
    // First try localStorage
    token = window.localStorage.getItem('_token')
    
    // If not found, try to get from Zustand store
    if (!token) {
      try {
        const userStorage = window.localStorage.getItem('user-storage')
        if (userStorage) {
          const parsed = JSON.parse(userStorage)
          token = parsed?.state?.user?.token
        }
      } catch (e) {
        console.error('Error parsing user storage:', e)
      }
    }
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return Promise.resolve(config)
})

instance.interceptors.response.use(async (response) => {
  return response
})

export default instance
