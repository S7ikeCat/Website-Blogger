import { AdminPage } from "@/widgets/admin-page/ui/AdminPage"
import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { redirect } from "next/navigation"




export default async function Page() {
    const user = await getCurrentUser()

    if(!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/")

    const categories = await prisma.category.findMany()

    return <AdminPage user={user} categories = {categories} />
}