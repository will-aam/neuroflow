import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:seu-email@dominio.com", // <-- Coloque seu email aqui
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(request: Request) {
  // ✅ ADICIONADO: Segurança para garantir que só a Vercel consegue rodar isso
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  try {
    const pendingEvents = await sql`
      SELECT e.*, s.endpoint, s.p256dh, s.auth
      FROM events e
      JOIN push_subscriptions s ON s.user_id = e.user_id
      WHERE e.is_notified = false
      AND (e.event_date - (e.notify_before || ' minutes')::interval) <= NOW()
    `;

    const results = await Promise.allSettled(
      pendingEvents.map(async (event) => {
        const payload = JSON.stringify({
          title: "Lembrete de Compromisso",
          body: event.title,
          icon: "/neuroflow.png", // Ajustado para o ícone que vi nos seus arquivos
        });

        const pushConfig = {
          endpoint: event.endpoint,
          keys: { p256dh: event.p256dh, auth: event.auth },
        };

        await webpush.sendNotification(pushConfig, payload);

        await sql`UPDATE events SET is_notified = true WHERE id = ${event.id}`;
      }),
    );

    return NextResponse.json({ processed: results.length });
  } catch (error) {
    console.error("Erro no Cron de Notificações:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
