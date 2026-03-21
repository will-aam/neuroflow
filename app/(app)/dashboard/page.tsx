import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Dashboard } from "@/components/dashboard"

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  const users = await sql`
    SELECT id, name, email, energy_mode FROM users WHERE id = ${session.userId}
  `

  if (users.length === 0) {
    redirect("/login")
  }

  const user = users[0] as {
    id: string
    name: string
    email: string
    energy_mode: "good" | "difficult" | "chaos"
  }

  return <Dashboard user={user} />
}
