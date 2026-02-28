"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { UploadButtonAvatar } from "@/shared/lib/uploadthing-avatar"

type Props = {
  initial: { username: string; email: string; avatarUrl: string; avatarKey?: string | null }
}

export default function SettingsPage({ initial }: Props) {
  const router = useRouter()

  const [username, setUsername] = useState(initial.username)
  const [email, setEmail] = useState(initial.email)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl)
  const [avatarKey, setAvatarKey] = useState(initial.avatarKey ?? "")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwOk, setPwOk] = useState<string | null>(null)

  async function onSave() {
    setLoading(true)
    setError(null)
    setOk(null)

    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          avatarUrl,
          avatarKey,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? "Update failed")
        return
      }

      setOk("Saved")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function onChangePassword() {
    setPwLoading(true)
    setPwError(null)
    setPwOk(null)

    try {
      if (newPassword !== confirmPassword) {
        setPwError("Passwords do not match")
        return
      }

      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPwError(data?.error ?? "Change password failed")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPwOk("Password changed")
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your profile and manage your password.
        </p>
      </div>

      <div className="grid gap-6">
        {/* PROFILE */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Profile</h2>
              <p className="mt-1 text-sm text-gray-600">Username, email and avatar.</p>
            </div>

            <button
              disabled={loading}
              onClick={onSave}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>

          <div className="mt-6 grid gap-5">
            {/* Avatar + upload row (NO overflow) */}
            <div className="grid grid-cols-[64px_1fr] items-start gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10 bg-white">
                <Image
                  src={avatarUrl?.trim() ? avatarUrl : "/default-avatar.jpg"}
                  alt="avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* IMPORTANT: min-w-0 prevents flex/grid children from overflowing */}
              <div className="min-w-0">
                <div className="w-30 h-22 overflow-hidden rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm">
                  <UploadButtonAvatar
                    endpoint="avatarImage"
                    onClientUploadComplete={(res) => {
                      const file = res?.[0]
                      if (!file?.serverData) return
                      const url = file.serverData.url
                      const key = file.serverData.key
                      if (url) setAvatarUrl(url)
                      if (key) setAvatarKey(key)
                    }}
                    onUploadError={(e: Error) => setError(e.message)}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {avatarUrl?.trim() && (
                    <button
                      type="button"
                      className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                      onClick={() => {
                        setAvatarUrl("")
                        setAvatarKey("")
                      }}
                    >
                      Remove avatar
                    </button>
                  )}

                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-900">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-900">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {ok && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {ok}
              </div>
            )}
          </div>
        </section>

        {/* SECURITY */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Security</h2>
              <p className="mt-1 text-sm text-gray-600">Change password.</p>
            </div>

            <button
              disabled={pwLoading}
              onClick={onChangePassword}
              className="rounded-xl border border-black/15 bg-black px-4 py-2 text-white text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
            >
              {pwLoading ? "Saving..." : "Change password"}
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-900">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-900">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-900">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            {pwError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pwError}
              </div>
            )}
            {pwOk && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {pwOk}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}