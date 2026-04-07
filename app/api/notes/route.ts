import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  try {
    const notes = await sql`
      SELECT * FROM daily_notes 
      WHERE user_id = ${session.id} AND date = ${date}
    `

    // Also get yesterday's reminder if viewing today
    const today = new Date().toISOString().split("T")[0]
    let yesterdayReminder = null
    
    if (date === today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split("T")[0]
      
      const yesterdayNote = await sql`
        SELECT reminder_for_tomorrow FROM daily_notes 
        WHERE user_id = ${session.id} AND date = ${yesterdayDate}
      `
      
      if (yesterdayNote.length > 0) {
        yesterdayReminder = yesterdayNote[0].reminder_for_tomorrow
      }
    }

    return NextResponse.json({ 
      note: notes[0] || null,
      yesterdayReminder 
    })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { date, content, reminderForTomorrow } = body

    if (!date || !content) {
      return NextResponse.json({ error: "Date and content are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO daily_notes (user_id, date, content, reminder_for_tomorrow)
      VALUES (${session.id}, ${date}, ${content}, ${reminderForTomorrow || null})
      ON CONFLICT (user_id, date) 
      DO UPDATE SET content = ${content}, reminder_for_tomorrow = ${reminderForTomorrow || null}, updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ note: result[0] })
  } catch (error) {
    console.error("Error saving note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
