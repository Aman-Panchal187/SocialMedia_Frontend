import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import OtpInput from '../../../components/common/OtpInput'
import Button from '../../../components/common/Button'
import Logo from '../../../components/common/Logo'
import { useAuth } from '../hooks/useAuth'

export default function VerifyOtpPage() {
  const location = useLocation()
  const email = location.state?.email
  const purpose = location.state?.purpose || 'email_verify'
  const [code, setCode] = useState('')
  const { verifyOtp, resendOtp, isVerifyOtpLoading } = useAuth()

  if (!email) {
    return <Navigate to="/register" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    try {
      await verifyOtp({ email, code })
    } catch {
      // Error toast already surfaced by the axios interceptor.
    }
  }

  const handleResend = async () => {
    try {
      await resendOtp({ email, purpose })
    } catch {
      // Error toast already surfaced by the axios interceptor.
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex justify-center">
        <Logo iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </div>
      <h1 className="mb-2 text-center text-2xl font-bold">Verify your email</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Enter the 6-digit code sent to {email}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <OtpInput length={6} value={code} onChange={setCode} />
        <Button type="submit" isLoading={isVerifyOtpLoading} className="w-full">
          Verify
        </Button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        className="mt-4 text-center text-sm font-semibold text-brand"
      >
        Resend code
      </button>
    </div>
  )
}
