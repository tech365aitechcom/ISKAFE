import { Suspense } from 'react'
import ResetPassword from './_components/ResetPassword'

export default function ResetPasswordWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  )
}
