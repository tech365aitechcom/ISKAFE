import axios from 'axios'
import useStore from '../stores/useStore'
import { API_BASE_URL } from '../constants/index'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

const authManager = {
  async refreshToken() {
    const { user } = useStore.getState()

    if (!user?.token) {
      throw new Error('No token available')
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      if (response.data.success && response.data.token) {
        const { setUser } = useStore.getState()
        const updatedUser = {
          ...response.data.user,
          token: response.data.token,
        }
        setUser(updatedUser)
        return response.data.token
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)

      if (error.response?.data?.requiresLogin) {
        this.logout()
      }

      throw error
    }
  },

  async ensureValidToken() {
    const { user } = useStore.getState()

    if (!user?.token) {
      return null
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
    }

    try {
      // Try to refresh the token proactively
      isRefreshing = true
      const newToken = await this.refreshToken()
      processQueue(null, newToken)
      return newToken
    } catch (error) {
      processQueue(error, null)
      throw error
    } finally {
      isRefreshing = false
    }
  },

  logout(redirectPath = '/login') {
    const { clearUser } = useStore.getState()
    clearUser()

    if (typeof window !== 'undefined') {
      window.location.href = redirectPath
    }
  },

  isTokenExpired(token) {
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)

      // Check if token expires in next 1 hour
      return payload.exp < currentTime + 3600 // 1 hour buffer
    } catch (error) {
      console.error('Error parsing token:', error)
      return true
    }
  },
}

export const checkAuthentication = () => {
  const { user } = useStore.getState()
  return !!(user?.token && !authManager.isTokenExpired(user.token))
}

export const authenticatedFetch = async (url, options = {}) => {
  const { user } = useStore.getState()

  if (!user?.token) {
    throw new Error('No authentication token available')
  }

  // Check if token is expired or will expire soon
  if (authManager.isTokenExpired(user.token)) {
    try {
      await authManager.ensureValidToken()
    } catch (error) {
      console.error('Failed to refresh token:', error)
      authManager.logout()
      throw new Error('Authentication failed')
    }
  }

  const { user: updatedUser } = useStore.getState()

  const config = {
    ...options,
    headers: {
      Authorization: `Bearer ${updatedUser.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    const response = await axios(url, config)
    return response
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.requiresLogin) {
      authManager.logout()
      throw new Error('Authentication required')
    }
    throw error
  }
}

export const validateTokenOnLoad = async () => {
  const { user } = useStore.getState()

  console.log('validateTokenOnLoad called with user:', !!user?.token)

  if (!user?.token) {
    console.log('No token found, returning invalid')
    return { isValid: false, shouldRedirect: false }
  }

  // If token is expired, try to refresh it
  if (authManager.isTokenExpired(user.token)) {
    console.log('Token is expired, attempting to refresh...')
    try {
      await authManager.ensureValidToken()
      console.log('Token refreshed successfully')
      return { isValid: true, shouldRedirect: false }
    } catch (error) {
      console.error('Token validation failed:', error)
      return { isValid: false, shouldRedirect: true }
    }
  }

  // Token is still valid, no need to make API call
  console.log('Token is still valid, no refresh needed')
  return { isValid: true, shouldRedirect: false }
}

export default authManager
