'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { GoogleLoginButton } from "@/components/GoogleLoginButton"
import { Button } from "@/components/ui/button";
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'start' | 'validate'>('start')
  const [message, setMessage] = useState('')
const router = useRouter()
  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&scope=profile email&prompt=select_account`

    window.location.href = googleAuthUrl
  }
  // 🔵 STEP 1: Start + Send OTP
  const handleStartAndSend = async () => {
    try {
      //setMessage('Starting authentication...')
      const res = await fetch('/api/login/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      console.log('🔐 Response from /start:', data)

      if (res.ok && data.authenticationToken) {
        setToken(data.authenticationToken)
        localStorage.setItem('vtexAuthToken', data.authenticationToken)

        setStep('validate')
        //setMessage('OTP has been sent to your email.')
      } else {
        setMessage(data.error || 'Failed to start authentication')
      }
    } catch (error) {
      console.error('❌ Error in start/send:', error)
      setMessage('Something went wrong while sending OTP')
    }
  }

  // 🟢 STEP 2: Validate OTP
// 🟢 STEP 2: Validate OTP
const handleValidate = async () => {
  try {
    const storedToken = token || localStorage.getItem('vtexAuthToken')

    const res = await fetch('/api/login/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        token: storedToken,
        code: otp,
      }),
    })

    const data = await res.json()
    console.log('✅ Response from /validate:', data)

    if (res.ok && data.customer) {
      //setMessage('✅ Login successful!')

      // Save to localStorage (or ideally cookies for security)
      localStorage.setItem('vtexUser', JSON.stringify(data.customer))

      // Redirect to account page
    router.push('/account')
    } else {
      setMessage(data.error || 'OTP validation failed')
    }
  } catch (error) {
    console.error('❌ Error in validate:', error)
    setMessage('Something went wrong during OTP validation')
  }
}

  return (
    <Layout>
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
       <Card>
      <CardHeader className="text-center">
       <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your account to continue shopping</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2 emailinput">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        disabled={step !== 'start'}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />
</div>
      {step === 'start' && (
        <button className="loginbtn right-0 top-0 h-full px-3 py-2" onClick={handleStartAndSend} style={{ width: '100%', padding: '10px' }}>
          Login
        </button>
      )}

      {step === 'validate' && (
        <>
        <div className="space-y-2 emailinput">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
          <button className="loginbtn right-0 top-0 h-full px-3 py-2" onClick={handleValidate} style={{ width: '100%', padding: '10px' }}>
            Validate OTP
          </button>
          </div>
        </>
      )}

      <p style={{ color: 'blue', marginTop: 20 }}>{message}</p>


<div className="mt-6 text-center space-y-2">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </Link>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

      </CardContent>




{/* <div className="p-10">
     
  <div>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
    </div> */}


      </Card>
    </div>
     </Layout>
  )
}
