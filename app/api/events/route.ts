import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Busca os eventos do usuário logado, ordenados do mais próximo pro mais distante
    const events = await sql`
      SELECT * FROM events
      WHERE user_id = ${session.id}
      ORDER BY event_date ASC
    `;

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
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
    const { title, eventDate, notifyBefore } = body;

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: "Title and eventDate are required" },
        { status: 400 },
      );
    }

    // notifyBefore é o tempo em minutos (ex: 1 dia = 1440)
    const result = await sql`
      INSERT INTO events (user_id, title, event_date, notify_before)
      VALUES (${session.id}, ${title.trim()}, ${eventDate}, ${notifyBefore || 0})
      RETURNING *
    `;

    return NextResponse.json({ event: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
