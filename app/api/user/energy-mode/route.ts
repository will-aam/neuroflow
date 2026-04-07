import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { energyMode } = body

    if (!energyMode || !["good", "difficult", "chaos"].includes(energyMode)) {
      return NextResponse.json({ error: "Invalid energy mode" }, { status: 400 })
    }

    await sql`
      UPDATE users SET energy_mode = ${energyMode}, updated_at = NOW()
      WHERE id = ${session.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating energy mode:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
