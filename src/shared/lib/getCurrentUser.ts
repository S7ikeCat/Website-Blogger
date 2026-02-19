import { cookies } from "next/headers"
import { prisma } from "@/shared/lib/prisma"
import { verifyToken } from "@/shared/lib/auth"

export async function getCurrentUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if(!token) return null

    try {
        const {userId} = verifyToken(token)
        return await prisma.user.findUnique({
            where: {id: userId},
            select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            avatarKey: true,
            role: true,
            },
        })
    } catch {
        return null
    }
}