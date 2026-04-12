"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Função auxiliar para converter a chave VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

      // 1. Pedir permissão explicitamente
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada.");
        return;
      }

      // 2. Converter a chave pública
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Chave pública VAPID não encontrada.");
        return;
      }
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // 3. Subscrever no browser
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // 4. Enviar para o backend usando .toJSON()
      // Isso garante que as chaves de criptografia sejam enviadas corretamente
      await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub.toJSON()),
        headers: { "Content-Type": "application/json" },
      });

      setSubscription(sub);
      toast.success("Notificações ativadas!");
    } catch (err) {
      console.error("Erro ao subscrever:", err);
      toast.error(
        "Erro ao ativar. Certifique-se de que o app está na 'Tela de Início'.",
      );
    }
  }

  if (!isSupported) return null;

  return (
    <div className="p-4 bg-card border rounded-2xl space-y-3 mt-4">
      <div className="flex items-center gap-3">
        <span className="material-icons text-primary">
          notifications_active
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">Notificações do Sistema</p>
          <p className="text-xs text-muted-foreground">
            Receba avisos de compromissos no telemóvel.
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
