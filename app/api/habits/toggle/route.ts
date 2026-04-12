import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { habitId, date, completed } = body;

    if (!habitId || !date) {
      return NextResponse.json(
        { error: "Habit ID and date are required" },
        { status: 400 },
      );
    }

    // Verify habit belongs to user (Corrigido para session.id)
    const habit = await sql`
      SELECT id FROM habits WHERE id = ${habitId} AND user_id = ${session.id}
    `;

    if (habit.length === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    if (completed) {
      // Upsert log (Corrigido para session.id)
      await sql`
        INSERT INTO daily_logs (user_id, habit_id, date, completed, completed_at)
        VALUES (${session.id}, ${habitId}, ${date}, true, NOW())
        ON CONFLICT (habit_id, date) 
        DO UPDATE SET completed = true, completed_at = NOW()
      `;
    } else {
      // Update to not completed
      await sql`
        UPDATE daily_logs 
        SET completed = false, completed_at = NULL 
        WHERE habit_id = ${habitId} AND date = ${date}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling habit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
