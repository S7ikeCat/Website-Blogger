import jwt, { JwtPayload as JwtLibPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) throw new Error("JWT_SECRET is missing in .env")

export type AuthTokenPayload  = {
    userId: number
}

export function signToken(payload: AuthTokenPayload ) {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "7d"})
}

export function verifyToken(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (typeof decoded === "string") {
        throw new Error("Invalid token format")
    }

    const payload = decoded as JwtLibPayload

  const userId = payload.userId
  if (typeof userId !== "number") {
    throw new Error("Invalid token payload: userId")
  }

  return { userId }
}