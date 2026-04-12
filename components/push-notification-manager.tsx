"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Função para converter a chave VAPID
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    toast.info("Iniciando ativação...");

    try {
      // Passo 1: Verificar Service Worker
      toast.info("Passo 1: Verificando Service Worker...");
      const registration = await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        toast.error("Este navegador não suporta notificações Push.");
        return;
      }

      // Passo 2: Pedir permissão
      toast.info("Passo 2: Solicitando permissão...");
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast.error(
          "Permissão negada. Ative manualmente nas configurações do site.",
        );
        return;
      }

      // Passo 3: Chave VAPID
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error(
          "Erro: Chave VAPID (Public Key) não encontrada no ambiente.",
        );
        return;
      }

      // Passo 4: Gerar assinatura no navegador
      toast.info("Passo 3: Gerando código de ativação...");
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Passo 5: Salvar no banco de dados
      toast.info("Passo 4: Sincronizando com o servidor...");
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub.toJSON()),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setSubscription(sub);
        toast.success("Notificações ativadas com sucesso!");
      } else {
        const errorData = await response.json();
        toast.error(
          `Erro no servidor: ${errorData.error || "Erro desconhecido"}`,
        );
      }
    } catch (err: any) {
      console.error("Erro fatal ao ativar push:", err);
      toast.error(
        `Falha técnica: ${err.message || "Verifique sua conexão ou HTTPS"}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <div className="p-4 bg-card border rounded-2xl space-y-3 mt-4">
      <div className="flex items-center gap-3 text-left">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-icons text-xl">notifications_active</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Alertas Inteligentes</p>
          <p className="text-xs text-muted-foreground">
            Receba lembretes automáticos dos seus compromissos.
          </p>
        </div>
      </div>

      <Button
        onClick={subscribeToPush}
        variant={subscription ? "outline" : "default"}
        className="w-full rounded-xl h-11 font-medium"
        disabled={!!subscription || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="material-icons animate-spin text-sm">sync</span>
            Processando...
          </span>
        ) : subscription ? (
          "Notificações Ativadas"
        ) : (
          "Ativar Notificações"
        )}
      </Button>

      {subscription && (
        <p className="text-[10px] text-center text-muted-foreground">
          Seu dispositivo está pronto para receber alertas.
        </p>
      )}
    </div>
  );
}
