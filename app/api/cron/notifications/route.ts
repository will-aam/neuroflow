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

    return new Response(`Não autorizado. Verifique os logs da Netlify.`, {
      status: 401,
    });
  }

  // ✅ Colocamos a configuração DENTRO da função!
  webpush.setVapidDetails(
    "mailto:seu-email@dominio.com", // <-- Coloque o seu email aqui
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
          title: "Lembrete de Compromisso",
          body: event.title,
          icon: "/neuroflow.png",
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
