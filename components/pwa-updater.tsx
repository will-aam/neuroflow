"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Dispara quando o SW executa o "skipWaiting" e assume a página
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setIsUpdating(true);

        // Dá 2.5 segundos para o usuário ler o aviso, então força o recarregamento
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      });
    }
  }, []);

  return (
    <AnimatePresence>
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-100 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 whitespace-nowrap"
        >
          <span className="material-icons animate-spin">autorenew</span>
          <span className="text-sm font-medium">
            Atualizando o aplicativo...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
