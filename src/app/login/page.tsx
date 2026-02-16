"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError(null)

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "appliaction/json"},
            body: JSON.stringify({email, password})
        })

        if(!res.ok) {
            const data = (await res.json()) as {error?: string}
            setError(data.error ?? "Login failed")
            return
        }

        router.push("/")
        router.refresh()
    }

    return (
        <div className=" ">
            <h1 className="">Login</h1>
            <form onSubmit={onSubmit} className="">
                <input className="" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input className="" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="">{error}</p>}

                <button className="">
                    Sign in
                </button>
            </form>
        </div>
    )
}