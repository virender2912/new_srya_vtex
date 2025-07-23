"use client"

import { useState } from "react"

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    document: "",
    phone: "",
  })

  const [message, setMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch("https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/pub/legacyAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const result = await res.json()

    if (res.ok) {
      setMessage("🎉 Account created successfully!")
      setForm({ firstName: "", lastName: "", email: "", password: "", document: "", phone: "" })
    } else {
      setMessage(`❌ ${result.error || "Signup failed"}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Account</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-3 w-full max-w-md">
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required className="border p-2 rounded" />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required className="border p-2 rounded" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="border p-2 rounded" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className="border p-2 rounded" />
        <input name="document" value={form.document} onChange={handleChange} placeholder="Document ID" required className="border p-2 rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required className="border p-2 rounded" />

        <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Create Account
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}
