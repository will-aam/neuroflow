import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const dbTime = await sql`SELECT NOW(), CURRENT_SETTING('TIMEZONE')`;

  return NextResponse.json({
    browser_time_local: new Date().toLocaleString("pt-BR"),
    iso_utc_time: new Date().toISOString(),
    database_now: dbTime[0].now,
    database_timezone: dbTime[0].current_setting,
    message:
      "Verifica se o 'database_now' (UTC) condiz com o horário atual de Londres (Aracaju + 3h).",
  });
}
