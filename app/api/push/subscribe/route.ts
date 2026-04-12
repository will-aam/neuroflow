import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const subscription = await request.json();

    // Guardamos os dados da assinatura vinculados ao ID do utilizador
    // Usamos ON CONFLICT para atualizar se o dispositivo já estiver registado
    await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
      VALUES (
        ${session.id}, 
        ${subscription.endpoint}, 
        ${subscription.keys.p256dh}, 
        ${subscription.keys.auth}
      )
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        p256dh = EXCLUDED.p256dh, 
        auth = EXCLUDED.auth;
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar assinatura push:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
