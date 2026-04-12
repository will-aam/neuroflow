"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ESSENCIAL: Converte a string do .env para o formato que o navegador exige
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
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (e) {
      console.error("Erro ao verificar assinatura:", e);
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          "Você precisa permitir as notificações nas configurações do navegador.",
        );
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Erro: Chave VAPID não configurada.");
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub.toJSON()),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setSubscription(sub);
        toast.success("Notificações ativadas com sucesso!");
      } else {
        toast.error("Erro ao salvar assinatura no servidor.");
      }
    } catch (err) {
      console.error("Erro ao ativar push:", err);
      toast.error(
        "Não foi possível ativar. Tente fechar e abrir o app novamente.",
      );
    }
  }

  if (!isSupported) return null;

  return (
    <div className="p-4 bg-card border rounded-2xl space-y-3 mt-4">
      <div className="flex items-center gap-3 text-left">
        <span className="material-icons text-primary">
          notifications_active
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">Alertas no Celular</p>
          <p className="text-xs text-muted-foreground">
            Ative para receber lembretes de médicos e hábitos.
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
