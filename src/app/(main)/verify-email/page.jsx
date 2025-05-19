import { Suspense } from 'react'
import VerifyEmail from './_components/VerifyEmail'

export default function VerifyEmailWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  )
}
