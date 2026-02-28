import jwt, { JwtPayload } from "jsonwebtoken"

export type AuthTokenPayload = { userId: number }

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is missing (set it in environment variables)")
  return secret
}

function isJwtPayload(x: unknown): x is JwtPayload {
  return typeof x === "object" && x !== null
}

function isAuthTokenPayload(x: unknown): x is AuthTokenPayload {
  if (!isJwtPayload(x)) return false

  const maybeUserId = (x as Record<string, unknown>)["userId"]
  return typeof maybeUserId === "number" && Number.isFinite(maybeUserId)
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" })
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded: unknown = jwt.verify(token, getJwtSecret())

  if (!isAuthTokenPayload(decoded)) {
    throw new Error("Invalid token payload: userId is missing or not a number")
  }

  return decoded
}