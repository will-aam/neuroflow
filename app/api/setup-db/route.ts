import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);`;

    return NextResponse.json({
      message: "Tabela de notificações criada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar tabela de notificações",
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}
