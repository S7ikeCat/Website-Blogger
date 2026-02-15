import { AdminPage } from "@/widgets/admin-page/ui/AdminPage"
import { prisma } from "@/shared/lib/prisma"



export default async function Page() {
    const categories = await prisma.category.findMany()

    return <AdminPage categories = {categories} />
}