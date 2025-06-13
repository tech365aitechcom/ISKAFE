'use client'

import { API_BASE_URL } from '@/src/constants'
import useStore from '../../stores/useStore'
import axios from 'axios'
import { SnackbarProvider } from 'notistack'
import { useEffect } from 'react'

export default function SnackbarProviderClient({ children }) {
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/master/roles`)
        useStore.getState().setRoles(response.data.result)
      } catch (err) {
        console.error('Failed to fetch roles:', err)
      }
    }
    fetchRoles()
  }, [])

  return <SnackbarProvider>{children}</SnackbarProvider>
}
