"use client"

import Logo from "@/shared/assets/logo.png"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

type NavbarUser = {
  id: number
  username: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
}

export function Navbar() {

  const [user, setUser] = useState<NavbarUser | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  async function loadUser() {
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
  }
  
    useEffect(() => {
      setLoading(true)
      loadUser()
    }, [pathname])
  
    async function logout() {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.refresh()
    }

  return (
    <div>
    {/* Navbar */}
    <div className="m-6">
    <div className="flex items-center justify-between w-full gap-6">
  {/* Logo */}
  <Link href="/">
  <Image
    src={Logo}
    alt="Logo"
    width={150}
    height={70}
  /></Link>
  {/* Button wrapper */}
  <div className="flex items-center gap-4">
    {!loading && !user && (
      <>
      <Link href="/login" className="font-semibold">Login</Link>
      <Link href="/register" className="font-semibold">Register</Link>
      </>
    )}

{!loading && user && (
  <>
  <Image
              src={user.avatarUrl ?? "/default-avatar.jpg"}
              alt=""
              width={56}
              height={56}
              unoptimized
              
            />
    <Link href={`/u/${user.username}`}>{user.username}</Link>

    <Link href="/posts/new">Create post</Link>

    {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}

    <button onClick={logout}>Logout</button>
  </>
)}
  </div>
</div>
</div>

  

</div>
  )
}

export default Navbar