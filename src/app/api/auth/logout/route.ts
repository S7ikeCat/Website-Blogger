import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set("token", "", { path: "/", maxAge: 0 })
  res.cookies.set("banned", "0", { httpOnly: true, path: "/" })
  
  return res


}