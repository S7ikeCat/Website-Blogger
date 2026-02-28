import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const banned = req.cookies.get("banned")?.value

  // уже на /banned — не зацикливаем
  if (req.nextUrl.pathname.startsWith("/banned")) return NextResponse.next()

  if (banned === "1") {
    const url = req.nextUrl.clone()
    url.pathname = "/banned"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}