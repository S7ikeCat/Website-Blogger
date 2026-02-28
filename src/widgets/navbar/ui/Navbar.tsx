"use client"

import Logo from "@/shared/assets/logo.png"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { FiBell } from "react-icons/fi"
import { useRef } from "react"
import { FiUser, FiSettings, FiLogOut, FiGrid } from "react-icons/fi"

type NavbarUser = {
  id: number
  username: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
}

type Notif = {
  id: number
  text: string
  href: string | null
  createdAt: string
  readAt: string | null
}

export function Navbar() {
  const [user, setUser] = useState<NavbarUser | null>(null)
  const [loading, setLoading] = useState(true)

  const pathname = usePathname()
  const router = useRouter()

  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
  function onDown(e: MouseEvent) {
    if (!profileRef.current) return
    if (!profileRef.current.contains(e.target as Node)) {
      setProfileOpen(false)
    }
  }
  document.addEventListener("mousedown", onDown)
  return () => document.removeEventListener("mousedown", onDown)
}, [])

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      const data = (await res.json()) as { user: NavbarUser | null }
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadNotifs = useCallback(async () => {
    if (!user) return

    const res = await fetch("/api/notifications", { cache: "no-store" })
    if (!res.ok) return

    const data: { items: Notif[]; unreadCount: number } = await res.json()
    setNotifs(data.items)
    setUnreadCount(data.unreadCount)
  }, [user])

  const markRead = useCallback(async () => {
    if (!user) return
    await fetch("/api/notifications/read", { method: "POST" })
    setUnreadCount(0)
  }, [user])

  const clearAllNotifs = useCallback(async () => {
    await fetch("/api/notifications/clear", { method: "POST" })
    setNotifs([])
    setUnreadCount(0)
  }, [])

  const removeNotif = useCallback((id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }, [])

  useEffect(() => {
    setLoading(true)
    loadUser()
  }, [pathname, loadUser])

  useEffect(() => {
    if (user) loadNotifs()
  }, [user, loadNotifs])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    {/* Left: logo */}
    <Link href="/" className="flex items-center gap-3">
      <Image src={Logo} alt="Logo" width={140} height={48} priority />
    </Link>

    {/* Right: actions */}
    <div className="flex items-center gap-3">
      {!loading && !user && (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-black/5 active:scale-[0.98]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-black/15 bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Register
          </Link>
        </div>
      )}

      {!loading && user && (
        <>
          {/* 🔔 Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={async () => {
                const next = !open;
                setOpen(next);

                if (next) {
                  await loadNotifs();
                  if (unreadCount > 0) await markRead();
                }
              }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
              aria-label="Notifications"
            >
              <FiBell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border border-black/20 bg-black px-1 text-[11px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-85 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                  <div className="text-sm font-semibold">Notifications</div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearAllNotifs}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-black/5 active:scale-[0.98]"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-black/5 active:scale-[0.98]"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-auto p-2">
                  {notifs.length === 0 ? (
                    <div className="rounded-xl p-3 text-sm text-gray-600">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifs.map((n) => (
                        <div
                          key={n.id}
                          className="rounded-xl border border-black/10 bg-white p-3 text-sm shadow-sm transition hover:shadow-md"
                        >
                          {n.href ? (
                            <Link
                              href={n.href}
                              onClick={() => {
                                removeNotif(n.id);
                                setOpen(false);
                              }}
                              className="block text-gray-800 hover:underline"
                            >
                              {n.text}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeNotif(n.id)}
                              className="w-full text-left text-gray-800 hover:underline"
                            >
                              {n.text}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
  <button
    type="button"
    onClick={() => {
      setProfileOpen((v) => !v)
      setOpen(false) // закрыть notifs, если открыты
    }}
    className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-black/5 active:scale-[0.99]"
    aria-label="Profile menu"
  >
    <span className="relative h-10 w-10 overflow-hidden rounded-full border border-black/15 bg-white">
      <Image
        src={user.avatarUrl ?? "/default-avatar.jpg"}
        alt="avatar"
        fill
        className="object-cover"
        unoptimized
      />
    </span>

    <span className="hidden text-sm font-semibold text-gray-800 sm:block">
      {user.username}
    </span>
  </button>

  {profileOpen && (
    <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
      <div className="px-4 py-3 border-b border-black/10">
        <div className="text-sm font-semibold text-gray-900">{user.username}</div>
        <div className="text-xs text-gray-500">Account</div>
      </div>

      <div className="p-2">
        <Link
          href={`/u/${user.username}`}
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-800 transition hover:bg-black/5"
        >
          <FiUser size={16} />
          Profile
        </Link>

        {user.role === "ADMIN" && (
  <Link
    href="/admin"
    onClick={() => setProfileOpen(false)}
    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-800 transition hover:bg-black/5"
  >
    <FiGrid size={16} />
    Dashboard
  </Link>
)}

        <Link
          href="/settings"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-800 transition hover:bg-black/5"
        >
          <FiSettings size={16} />
          Settings
        </Link>

        <button
          type="button"
          onClick={() => {
            setProfileOpen(false)
            logout()
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-800 transition hover:bg-black/5"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )}
</div>

          {/* Actions */}
          {user.role !== "ADMIN" && (
  <Link
    href="/posts/new"
    className="hidden rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] sm:inline-flex"
  >
    Create post
  </Link>
)}

{user.role === "ADMIN" && (
  <Link
    href="/admin"
    className="hidden rounded-xl border border-black/15 bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:inline-flex"
  >
    Dashboard
  </Link>
)}

        
        </>
      )}
    </div>
  </div>
</header>
  )
}

export default Navbar