"use client"

import Logo from "@/shared/assets/logo.png"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"

type NavbarUser = {
  id: number
  username: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
}

export function Navbar() {

  const [user, setUser] = useState<NavbarUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  
    loadUser()
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", {method: "POST"})
    setUser(null)
    window.location.reload()
  }

  return (
    <div>
    {/* Navbar */}
    <div className="m-6">
    <div className="flex items-center justify-between w-full gap-6">
  {/* Logo */}
  <Image
    src={Logo}
    alt="Logo"
    width={150}
    height={70}
  />
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
      <span className="font-semibold">
        <Link href={`/u/${user.username}`}>
        {user.username}
        </Link>
        
      </span>

      {user.role === "ADMIN" && (
        <Link href="/admin" className="font-semibold">Admin</Link>
      )}

      <button onClick={logout} className="font-semibold">Logout</button>
      </>
    )}
  </div>
</div>
</div>

  

</div>
  )
}

export default Navbar