"use client"

import Logo from "@/shared/assets/logo.png"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { FiBell } from "react-icons/fi"

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
    <div className="m-6">
      <div className="flex  justify-between w-full gap-6">
        <Link href="/">
          <Image src={Logo} alt="Logo" width={150} height={70} />
        </Link>

        <div className="flex items-center gap-4">
          {!loading && !user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {!loading && user && (
            <>
             {/* 🔔 Notifications */}
             <div className="flex justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const next = !open
                    setOpen(next)

                    if (next) {
                      await loadNotifs()
                      if (unreadCount > 0) await markRead()
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white"
                  aria-label="Notifications"
                >
                  <FiBell size={20} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-black bg-white px-1 text-[11px] font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className=" border-2 border-black bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b-2 border-black px-4 py-2 gap-3">
                      <div className="text-sm font-bold">Notifications</div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={clearAllNotifs}
                          className="border-2 border-black px-3 py-1 text-sm"
                        >
                          Clear
                        </button>

                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="border-2 border-black px-3 py-1 text-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-auto p-2">
                      {notifs.length === 0 ? (
                        <div className="p-2 text-sm">No notifications</div>
                      ) : (
                        notifs.map((n) => (
                          <div
                            key={n.id}
                            className="mb-2 border-2 border-black p-2 text-sm"
                          >
                            {n.href ? (
                              <Link
                                href={n.href}
                                onClick={() => {
                                  removeNotif(n.id)
                                  setOpen(false)
                                }}
                                className="block"
                              >
                                {n.text}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeNotif(n.id)}
                                className="text-left"
                              >
                                {n.text}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-black">
              <Image
                src={user.avatarUrl ?? "/default-avatar.jpg"}
                alt=""
                width={56}
                height={56}
                unoptimized
              />
</div>
              <Link href={`/u/${user.username}`}>{user.username}</Link>

              <Link href="/posts/new">Create post</Link>

              {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}

             

              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar