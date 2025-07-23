'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('') // you can pass it via URL or context

  const handleSubmit = async () => {
    const res = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    if (data.success) {
      router.push('/account') // ✅ Redirect to account page
    } else {
      setError('Invalid OTP')
    }
  }

  return (
    <div>
      <input value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={handleSubmit}>Verify</button>
      {error && <p>{error}</p>}
    </div>
  )
}
