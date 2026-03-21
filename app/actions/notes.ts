"use server"

import { sql, type DailyNote } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { dailyNoteSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getDailyNote(date: string): Promise<DailyNote | null> {
  const user = await requireAuth()
  const notes = await sql`
    SELECT * FROM daily_notes 
    WHERE user_id = ${user.id} AND date = ${date}
  `
  return notes[0] as DailyNote | null
}

export async function saveDailyNote(formData: FormData): Promise<{ error?: string }> {
  const user = await requireAuth()

  const raw = {
    date: formData.get("date"),
    content: formData.get("content"),
    reminder_for_tomorrow: formData.get("reminder_for_tomorrow") || undefined,
  }

  const parsed = dailyNoteSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { date, content, reminder_for_tomorrow } = parsed.data

  await sql`
    INSERT INTO daily_notes (user_id, date, content, reminder_for_tomorrow)
    VALUES (${user.id}, ${date}, ${content}, ${reminder_for_tomorrow || null})
    ON CONFLICT (user_id, date) 
    DO UPDATE SET content = ${content}, reminder_for_tomorrow = ${reminder_for_tomorrow || null}, updated_at = NOW()
  `

  revalidatePath("/dashboard")
  return {}
}

export async function getYesterdayReminder(): Promise<string | null> {
  const user = await requireAuth()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split("T")[0]

  const notes = await sql`
    SELECT reminder_for_tomorrow FROM daily_notes 
    WHERE user_id = ${user.id} AND date = ${dateStr}
  `

  return notes[0]?.reminder_for_tomorrow || null
}
