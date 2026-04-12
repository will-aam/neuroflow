"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Pedir permissão
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada.");
        return;
      }

      // Subscrever no browser
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Enviar para o nosso backend
      await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: { "Content-Type": "application/json" },
      });

      setSubscription(sub);
      toast.success("Notificações ativadas com sucesso!");
    } catch (err) {
      console.error("Erro ao subscrever:", err);
      toast.error(
        "Erro ao ativar notificações. Certifica-te que adicionaste o app à Tela de Início.",
      );
    }
  }

  if (!isSupported) return null;

  return (
    <div className="p-4 bg-card border rounded-2xl space-y-3">
      <div className="flex items-center gap-3">
        <span className="material-icons text-primary">
          notifications_active
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">Notificações do Sistema</p>
          <p className="text-xs text-muted-foreground">
            Recebe avisos de médicos e hábitos no teu telemóvel.
          </p>
        </div>
      </div>
      <Button
        onClick={subscribeToPush}
        variant={subscription ? "outline" : "default"}
        className="w-full rounded-xl"
        disabled={!!subscription}
      >
        {subscription ? "Notificações Ativas" : "Ativar Notificações"}
      </Button>
    </div>
  );
}
