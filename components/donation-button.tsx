"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function DonationButton() {
  const [copied, setCopied] = useState(false);
  const pixKey = "01acacd7-b15c-40ac-af21-a98c364cebb6";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixKey);
    setCopied(true);

    // Volta o botão ao normal depois de 2 segundos
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* O motion.div cria a animação do botão flutuante */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
          }}
          className="fixed bottom-28 md:bottom-8 right-4 md:right-8 z-50"
        >
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-amber-500 hover:bg-amber-600 text-white border-4 border-background transition-colors"
          >
            <span className="material-icons text-2xl leading-none">coffee</span>
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md text-center border-amber-500/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex flex-col items-center gap-3 mt-2">
            <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center">
              <span className="material-icons text-amber-500 text-3xl">
                local_cafe
              </span>
            </div>
            Pague um café para o Dev!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Se o <strong>NeuroFlow</strong> está ajudando a organizar sua rotina
            e manter o foco, considere apoiar o projeto! Sua doação ajuda a
            manter os servidores no ar e me incentiva a continuar melhorando e
            criando novas funcionalidades. 💛
          </p>

          <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-3 relative overflow-hidden">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Chave PIX (Aleatória)
            </p>
            <p className="text-xs sm:text-sm font-mono break-all bg-background p-3 rounded-lg border shadow-sm selection:bg-amber-500/30">
              {pixKey}
            </p>

            <Button
              onClick={handleCopy}
              className={cn(
                "w-full transition-all duration-300",
                copied
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "bg-primary text-primary-foreground",
              )}
            >
              <span className="material-icons mr-2 text-[18px]">
                {copied ? "check_circle" : "content_copy"}
              </span>
              {copied ? "Chave PIX copiada!" : "Copiar Chave PIX"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
