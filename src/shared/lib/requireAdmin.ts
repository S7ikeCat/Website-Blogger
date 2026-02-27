import { getCurrentUser } from "@/shared/lib/getCurrentUser"

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) return null
  if (user.role !== "ADMIN") return null
  return user
}