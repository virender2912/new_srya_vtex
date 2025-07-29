'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/auth-context"
// import { signIn } from "next-auth/react"
export default function LoginPage() { 
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'start' | 'validate'>('start')
  const [message, setMessage] = useState('')
const router = useRouter()
const { dispatch } = useAuth()
const { login } = useAuth()
 const handleFacebookLogin = () => {
    window.location.href = '/api/login/facebook'
  }
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
      // Save user in localStorage
      localStorage.setItem('vtex-user', JSON.stringify(data.customer))

      // ✅ Dispatch login success to update auth context
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          id: data.customer.id || 'vtex-unknown',
          email: data.customer.email,
          firstName: data.customer.firstName || '',
          lastName: data.customer.lastName || '',
          phone: data.customer.phone,
          isEmailVerified: true,
        },
      })

      // Redirect to account
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
                {/* <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </Link> */}
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

      </CardContent>




<div className="p-10">
  <div>
    <button
      onClick={handleGoogleLogin}
      className="flex items-center gap-2 border border-black rounded-md px-4 py-2 googlebtn"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 256 262"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M255.99 133.49c0-8.91-.8-17.48-2.31-25.76H130.6v48.83h70.54c-3.05 16.49-12.17 30.46-25.92 39.78v32.99h41.94c24.57-22.63 38.83-56.04 38.83-95.84z"
          fill="#4285F4"
        />
        <path
          d="M130.6 261c35.1 0 64.57-11.62 86.09-31.52l-41.94-32.99c-11.63 7.8-26.45 12.41-44.15 12.41-33.92 0-62.67-22.89-72.96-53.6H14.61v33.64c21.49 42.63 65.78 72.06 115.99 72.06z"
          fill="#34A853"
        />
        <path
          d="M57.64 155.3c-2.69-7.99-4.24-16.52-4.24-25.3 0-8.77 1.55-17.31 4.24-25.3V71.05H14.61C5.24 89.67 0 110.34 0 130c0 19.66 5.24 40.33 14.61 58.95l43.03-33.65z"
          fill="#FBBC05"
        />
        <path
          d="M130.6 51.07c18.99 0 35.97 6.53 49.38 19.37l37.06-37.06C195.17 13.1 165.7 0 130.6 0 80.39 0 36.1 29.43 14.61 71.05l43.03 33.65c10.29-30.71 39.04-53.6 72.96-53.6z"
          fill="#EA4335"
        />
      </svg>
      Login with Google
    </button>



 <button
        onClick={handleFacebookLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login with Facebook
      </button>
    


  </div>
</div>



      </Card>
    </div>
     </Layout>
  )
}
