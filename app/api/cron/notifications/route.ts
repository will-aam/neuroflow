import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:teu-email@dominio.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(request: Request) {
  // Verificação de segurança para o Cron (ex: Header de autorização da Vercel)
  // if (request.headers.get('auth') !== process.env.CRON_SECRET) ...

  try {
    // 1. Procurar eventos que precisam de notificação AGORA
    // Lógica: (Data do Evento - Minutos de Antecedência) <= Agora E ainda não notificado
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
          icon: "/icon-192x192.png",
        });

        const pushConfig = {
          endpoint: event.endpoint,
          keys: { p256dh: event.p256dh, auth: event.auth },
        };

        await webpush.sendNotification(pushConfig, payload);

        // Marcar como notificado para não repetir
        await sql`UPDATE events SET is_notified = true WHERE id = ${event.id}`;
      }),
    );

    return NextResponse.json({ processed: results.length });
  } catch (error) {
    console.error("Erro no Cron de Notificações:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
