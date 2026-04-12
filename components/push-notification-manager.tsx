"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setSubscription(sub);
      }
    } catch (e) {
      console.error("Erro ao verificar assinatura:", e);
    }
  }

  async function subscribeToPush() {
    if (!window.isSecureContext) {
      toast.error("Notificações exigem HTTPS (ambiente seguro).");
      return;
    }

    setLoading(true);
    const id = toast.loading("Preparando sistema de mensagens...");

    try {
      // PASSO 1: Forçar Registro/Ativação do Service Worker
      let registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        toast.loading("Registrando motor do app...", { id });
        registration = await navigator.serviceWorker.register("/sw.js");
      }

      // Aguarda o Service Worker estar pronto com um timeout de 5 segundos
      const swReady = (await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Timeout: Service Worker demorou muito para responder.",
                ),
              ),
            5000,
          ),
        ),
      ])) as ServiceWorkerRegistration;

      // PASSO 2: Solicitar Permissão Nativa
      toast.loading("Aguardando sua permissão no navegador...", { id });
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast.error(
          "Permissão negada. Ative as notificações no cadeado do navegador.",
          { id },
        );
        setLoading(false);
        return;
      }

      // PASSO 3: Validar Chave VAPID
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Erro técnico: Chave de comunicação não encontrada.", {
          id,
        });
        setLoading(false);
        return;
      }

      // PASSO 4: Criar Assinatura Digital
      toast.loading("Gerando identificador do dispositivo...", { id });
      const sub = await swReady.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // PASSO 5: Salvar no Banco (Neon via Netlify)
      toast.loading("Sincronizando com sua conta...", { id });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub.toJSON()),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setSubscription(sub);
        toast.success("Tudo pronto! Você receberá alertas neste celular.", {
          id,
        });
      } else {
        throw new Error("Falha ao salvar no servidor.");
      }
    } catch (err: any) {
      console.error("Erro Push:", err);
      toast.error(err.message || "Erro ao ativar. Tente atualizar a página.", {
        id,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <div className="p-4 bg-card border rounded-2xl space-y-3 mt-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-icons text-xl">notifications_active</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Notificações Push</p>
          <p className="text-xs text-muted-foreground">
            Receba lembretes de médicos e hábitos.
          </p>
        </div>
      </div>

      <Button
        onClick={subscribeToPush}
        variant={subscription ? "outline" : "default"}
        className="w-full rounded-xl h-11"
        disabled={loading || !!subscription}
      >
        {loading
          ? "Processando..."
          : subscription
            ? "Notificações Ativadas"
            : "Ativar Notificações"}
      </Button>
    </div>
  );
}
