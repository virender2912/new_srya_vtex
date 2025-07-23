'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

export default function VerifyPage() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const { email, setIsAuthenticated } = useAuth()
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })

    if (res.ok) {
      setIsAuthenticated(true)
      router.push('/account') // Or any protected route
    } else {
      const data = await res.json()
      setError(data.message || 'Invalid OTP')
    }
  }

  if (!email) return <p>Please login first.</p>

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Enter OTP sent to {email}</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={{ padding: 10, width: '100%', marginBottom: 10 }}
        />
        <button type="submit">Verify OTP</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
