import React from 'react'
import ProtectedRoutes from './ProtectedRoutes'

export const metadata = {
  title: 'IKF - International Kickboxing Federation Admin',
  description:
    'The IKF is the world’s largest amateur and professional kickboxing organization.',
}

const AdminLayout = ({ children }) => {
  return <ProtectedRoutes>{children}</ProtectedRoutes>
}

export default AdminLayout
