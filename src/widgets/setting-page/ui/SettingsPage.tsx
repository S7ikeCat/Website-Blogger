"use client"

import { useRouter } from "next/navigation"
import { useState } from "react";
import { UploadButtonAvatar } from "@/shared/lib/uploadthing-avatar"



type Props = {
    initial: {username: string; email: string; avatarUrl: string; avatarKey?: string | null}
}

export default function SettingsPage({initial}: Props) {
    const router = useRouter()

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [pwLoading, setPwLoading] = useState(false)
    const [pwError, setPwError] = useState<string | null>(null)
    const [pwOk, setPwOk] = useState<string | null>(null)

    const [username, setUsername] = useState(initial.username)
    const [email, setemail] = useState(initial.email)
    const [avatarUrl, setavatarUrl] = useState(initial.avatarUrl)
    const [avatarKey, setAvatarKey] = useState(initial.avatarKey ?? "")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ok, setOk] = useState<string | null>(null)


    async function onChangePassword() {
        setPwLoading(true)
        setPwError(null)
        setPwOk(null)

        try {
            if(newPassword !== confirmPassword) {
                setPwError("Password don't match")
                return
            }
            const res = await fetch("/api/users/change-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({currentPassword, newPassword})
            }) 

            const data = await res.json().catch(() => ({}))
            if(!res.ok) {
                setPwError(data?.error ?? "Change password failed")
                return
            }

            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setPwOk("Password changed")
        } finally {
            setPwLoading(false)
        }
    }


    async function onSave() {
        setLoading(true)
        setError(null)
        setOk(null)
        

        try {
            const res = await fetch("/api/users/update-profile", {
                method: "PATCH",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({username, email, avatarUrl, avatarKey})
            })

            const data = await res.json().catch(() => ({}))

            if(!res.ok) {
                setError(data?.console.error ?? "Update failed");
                return
                
            }

            setOk("Saved")

            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="">
            <h1 className="">Setting</h1>

            <div className="">
                <div className="">Username</div>
                <input className="" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>


            <div className="">
                <div className="">Email</div>
                <input className="" value={email} onChange={(e) => setemail(e.target.value)} />
            </div>

            <div className="">
                <div className="">Avatar</div>
                <UploadButtonAvatar endpoint="avatarImage" onClientUploadComplete={(res) => {
                    const file = res?.[0]
                    if (!file) return
                    const url = file.serverData?.url
                    const key = file.serverData?.key

                    if (url) setavatarUrl(url)
                    if (key) setAvatarKey(key)
                }}
            onUploadError={(error: Error) => {
                alert(`Upload error: ${error.message}`)
            }}
            />

            {avatarUrl && (
                <button type="button" className="mt-2 border-2 border-black bg-white px-3 py-2 text-sm font-semibold" onClick={() => {setavatarUrl(""); setAvatarKey("")}}>
                    Remove avatar</button>
            )}

            <div className="">{avatarUrl || "No avatar"}</div>
            </div>

            {error && <div className="border-2 border-black bg-white p-2 text-sm">{error}</div>}
            {ok && <div className="border-2 border-black bg-white p-2 text-sm">{ok}</div>}

            <button disabled={loading} onClick={onSave} className="border-2 border-black bg-white px-4 py-2 font-semibold disabled:opacity-50">
                {loading ? "Saving..." : "Save"}
            </button>


            <div className="mt-9">
                <h2 className="">Change password</h2>

                <div className="">
                    <div className="">Current password</div>
                    <input type="password" className="" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>

                <div className="">
                    <div className="">New password</div>
                    <input type="password" className="" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                </div>

                <div className="">
                    <div className="">Confirm new password</div>
                    <input type="password" className="" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>

                {pwError && <div className="">{pwError}</div>}
                {pwOk && <div className="">{pwOk}</div>}

                <button disabled={pwLoading} onClick={onChangePassword} className="border-2 border-black bg-white px-4 py-2 font-semibold disabled:opacity-50">
                    {pwLoading ? "Saving..." : "Change password"}
                </button>
            </div>
        </div>
    )
}