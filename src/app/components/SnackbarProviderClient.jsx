'use client'

import { SnackbarProvider } from 'notistack'

export default function SnackbarProviderClient({ children }) {
  return <SnackbarProvider>{children}</SnackbarProvider>
}
