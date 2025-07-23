"use client"

export function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Login with Google
    </button>
  )
}
