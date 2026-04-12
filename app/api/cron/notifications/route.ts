import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import webpush from "web-push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedHeader) {
    console.error(
      `Bloqueado! Recebido: "${authHeader}" | Esperado: "${expectedHeader}"`,
    );
    return new Response(`Não autorizado.`, { status: 401 });
  }

  webpush.setVapidDetails(
    "mailto:seu-email@dominio.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

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
          title: "Lembrete: " + event.title,
          body: "Está na hora do seu compromisso!",
          icon: "/icon-192x192.png",
        });

        // Primeiro definimos a configuração
        const pushConfig = {
          endpoint: event.endpoint,
          keys: { p256dh: event.p256dh, auth: event.auth },
        };

        // Depois enviamos (apenas uma vez)
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
