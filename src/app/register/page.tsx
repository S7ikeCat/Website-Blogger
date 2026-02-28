"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? "Sign up failed")
      return
    }
    if (!res.ok) {
        const text = await res.text()
        console.log("REGISTER ERROR:", res.status, text)
        let msg = "Sign up failed"
        try {
          const data = JSON.parse(text) as { error?: string }
          msg = data.error ?? msg
        } catch {}
        setError(msg)
        return
      }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              placeholder="Repeat your password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  )
}