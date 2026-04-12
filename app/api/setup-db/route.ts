import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Cria a tabela (agora com user_id como texto e sem foreign key estrita)
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        event_date TIMESTAMP WITH TIME ZONE NOT NULL,
        notify_before INTEGER NOT NULL DEFAULT 0,
        is_notified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Cria os índices
    await sql`CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_notification ON events(event_date, is_notified);`;

    return NextResponse.json({
      message: "Tabela de eventos criada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar tabela de eventos",
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}
