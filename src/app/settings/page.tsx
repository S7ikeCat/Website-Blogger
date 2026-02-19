import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import SettingsPage from "@/widgets/setting-page/ui/SettingsPage";
import { redirect } from "next/navigation";


export default async function Page() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    return(
        <SettingsPage
        initial = {{username: user.username, email: user.email, avatarUrl: user.avatarUrl ?? "", avatarKey: user.avatarKey ?? null}}
        />
    )
}