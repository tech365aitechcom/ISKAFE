import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useStore from '../stores/useStore'
import authManager, { checkAuthentication, authenticatedFetch } from '../utils/authUtils'

export const useAuth = () => {
  const router = useRouter()
  const user = useStore((state) => state.user)
  const clearUser = useStore((state) => state.clearUser)

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return checkAuthentication()
  }, [])

  // Logout function
  const logout = useCallback((redirectPath = '/login') => {
    clearUser()
    authManager.logout(redirectPath)
  }, [clearUser])

  // Make authenticated API request
  const apiRequest = useCallback(async (url, options = {}) => {
    try {
      return await authenticatedFetch(url, options)
    } catch (error) {
      console.error('API request failed:', error)
      
      // If authentication failed, logout
      if (error.message === 'Authentication required' || error.message === 'Authentication failed') {
        logout()
      }
      
      throw error
    }
  }, [logout])

  // Auto-refresh token periodically
  useEffect(() => {
    if (!user?.token) return

    // Check token validity every 5 minutes
    const interval = setInterval(async () => {
      try {
        await authManager.ensureValidToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, logout the user
        logout()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [user?.token, logout])

  return {
    user,
    isAuthenticated,
    logout,
    apiRequest,
  }
}

export default useAuth