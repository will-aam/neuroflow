import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    const habits = await sql`
      SELECT * FROM habits 
      WHERE user_id = ${session.id} AND is_active = true
      ORDER BY phase, sort_order, created_at
    `;

    const logs = await sql`
      SELECT * FROM daily_logs 
<<<<<<< HEAD
      WHERE user_id = ${session.id} AND date = ${date}
    `
=======
      WHERE user_id = ${session.id} AND completed_at = ${date}
    `;
>>>>>>> 2e5de51 (Implement event management API with GET and POST endpoints, including database setup for events table)

    return NextResponse.json({ habits, logs });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      frequency,
      phase,
      dopamineWeight,
      isMiniHabit,
    } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO habits (user_id, title, description, frequency, phase, dopamine_weight, is_mini_habit)
<<<<<<< HEAD
      VALUES (${session.id}, ${title.trim()}, ${description || null}, ${frequency || 'daily'}, ${phase || 'morning'}, ${dopamineWeight || 1}, ${isMiniHabit || false})
=======
      VALUES (${session.id}, ${title.trim()}, ${description || null}, ${frequency || "daily"}, ${phase || "morning"}, ${dopamineWeight || 1}, ${isMiniHabit || false})
>>>>>>> 2e5de51 (Implement event management API with GET and POST endpoints, including database setup for events table)
      RETURNING *
    `;

    return NextResponse.json({ habit: result[0] });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
