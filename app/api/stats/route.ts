import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get total active habits
    const habitsResult = await sql`
      SELECT COUNT(*) as count FROM habits 
      WHERE user_id = ${session.id} AND is_active = true
    `
    const totalHabits = parseInt(habitsResult[0]?.count || "0")

    // Get completions today
    const today = new Date().toISOString().split("T")[0]
    const todayResult = await sql`
      SELECT COUNT(*) as count FROM daily_logs 
      WHERE user_id = ${session.id} AND date = ${today} AND completed = true
    `
    const completedToday = parseInt(todayResult[0]?.count || "0")

    // Get total completions
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM daily_logs 
      WHERE user_id = ${session.id} AND completed = true
    `
    const totalCompletions = parseInt(totalResult[0]?.count || "0")

    // Calculate weekly completion rate
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoString = weekAgo.toISOString().split("T")[0]

    const weeklyLogsResult = await sql`
      SELECT COUNT(*) as count FROM daily_logs 
      WHERE user_id = ${session.id} 
      AND date >= ${weekAgoString} 
      AND completed = true
    `
    const weeklyCompletions = parseInt(weeklyLogsResult[0]?.count || "0")
    const possibleWeeklyCompletions = totalHabits * 7
    const weeklyCompletion = possibleWeeklyCompletions > 0 
      ? Math.round((weeklyCompletions / possibleWeeklyCompletions) * 100) 
      : 0

    // Calculate current streak (simplified - days with at least one completion)
    const streakResult = await sql`
      SELECT DISTINCT date FROM daily_logs 
      WHERE user_id = ${session.id} AND completed = true
      ORDER BY date DESC
      LIMIT 30
    `
    
    let currentStreak = 0
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)
    
    for (const row of streakResult) {
      const logDate = new Date(row.date)
      logDate.setHours(0, 0, 0, 0)
      
      if (logDate.getTime() === checkDate.getTime()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (logDate.getTime() === checkDate.getTime() - 86400000) {
        currentStreak++
        checkDate = logDate
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return NextResponse.json({
      totalHabits,
      completedToday,
      currentStreak,
      bestStreak: currentStreak, // Simplified for now
      weeklyCompletion,
      totalCompletions
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
