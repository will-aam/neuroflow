"use server"

import { sql, type Habit, type DailyLog } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { habitSchema, energyModeSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getHabits(): Promise<Habit[]> {
  const user = await requireAuth()
  const habits = await sql`
    SELECT * FROM habits 
    WHERE user_id = ${user.id} AND is_active = true
    ORDER BY phase, sort_order, created_at
  `
  return habits as Habit[]
}

export async function createHabit(formData: FormData): Promise<{ error?: string }> {
  const user = await requireAuth()

  const raw = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    frequency: formData.get("frequency") || "daily",
    phase: formData.get("phase") || "morning",
    dopamine_weight: Number(formData.get("dopamine_weight")) || 1,
    is_mini_habit: formData.get("is_mini_habit") === "true",
  }

  const parsed = habitSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { title, description, frequency, phase, dopamine_weight, is_mini_habit } = parsed.data

  await sql`
    INSERT INTO habits (user_id, title, description, frequency, phase, dopamine_weight, is_mini_habit)
    VALUES (${user.id}, ${title}, ${description || null}, ${frequency}, ${phase}, ${dopamine_weight}, ${is_mini_habit})
  `

  revalidatePath("/dashboard")
  return {}
}

export async function deleteHabit(habitId: string): Promise<void> {
  const user = await requireAuth()
  await sql`
    UPDATE habits SET is_active = false 
    WHERE id = ${habitId} AND user_id = ${user.id}
  `
  revalidatePath("/dashboard")
}

export async function getDailyLogs(date: string): Promise<DailyLog[]> {
  const user = await requireAuth()
  const logs = await sql`
    SELECT * FROM daily_logs 
    WHERE user_id = ${user.id} AND date = ${date}
  `
  return logs as DailyLog[]
}

export async function toggleHabitCompletion(
  habitId: string,
  date: string,
  completed: boolean
): Promise<{ completed: boolean }> {
  const user = await requireAuth()

  if (completed) {
    await sql`
      INSERT INTO daily_logs (user_id, habit_id, date, completed, completed_at, energy_mode)
      VALUES (${user.id}, ${habitId}, ${date}, true, NOW(), ${user.energy_mode})
      ON CONFLICT (habit_id, date) 
      DO UPDATE SET completed = true, completed_at = NOW()
    `
  } else {
    await sql`
      DELETE FROM daily_logs 
      WHERE habit_id = ${habitId} AND date = ${date} AND user_id = ${user.id}
    `
  }

  revalidatePath("/dashboard")
  return { completed }
}

export async function updateEnergyMode(mode: "good" | "difficult" | "chaos"): Promise<void> {
  const user = await requireAuth()

  const parsed = energyModeSchema.safeParse(mode)
  if (!parsed.success) return

  await sql`UPDATE users SET energy_mode = ${mode} WHERE id = ${user.id}`
  revalidatePath("/dashboard")
}
