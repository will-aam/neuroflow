// components/donation-modal.tsx
"use client";

import { useState } from "react";
import { Coffee, Copy, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DonationModal() {
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText("01acacd7-b15c-40ac-af21-a98c364cebb6");
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "relative flex flex-col md:flex-row items-center md:justify-center lg:justify-start gap-1 md:gap-4 px-1 sm:px-2 md:px-4 py-2 md:py-3 md:w-full md:rounded-xl transition-all group shrink-0 cursor-pointer border-none",
            "text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:scale-105 active:scale-95",
          )}
        >
          <div className="relative">
            <Coffee className="h-6 w-6 md:h-5 md:w-5 relative z-10" />
            {/* Efeito brilhante super sutil atrás do café no desktop */}
            <span className="absolute inset-0 bg-amber-400/40 blur-sm rounded-full z-0"></span>
          </div>
          <span className="text-[10px] md:hidden lg:block lg:text-sm font-bold mt-0.5">
            Apoiar
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-[95%] rounded-3xl border-amber-200 dark:border-amber-900/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-amber-600 dark:text-amber-500">
            <Coffee className="h-6 w-6" />
            Cafezinho pro dev?
          </DialogTitle>
          <DialogDescription className="text-base text-left text-muted-foreground mt-4 leading-relaxed">
            O <strong>Neuroflow</strong> é um projeto independente feito com
            muito carinho para ajudar no seu dia a dia! 🚀
            <br />
            <br />
            Sua doação ajuda a pagar os custos de servidor e banco de dados, me
            motivando a trazer ainda mais melhorias e garantir que o app
            permaneça <strong>100% gratuito e sem anúncios</strong> para todos.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl mt-2 flex flex-col gap-3 border border-amber-100 dark:border-amber-900/30">
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Chave PIX (Aleatória):
          </span>
          <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-border shadow-inner">
            <code className="flex-1 text-xs sm:text-sm font-mono text-muted-foreground break-all px-2">
              01acacd7-b15c-40ac-af21-a98c364cebb6
            </code>
            <Button
              size="icon"
              variant={copiedPix ? "default" : "secondary"}
              onClick={handleCopyPix}
              className={cn(
                "shrink-0 transition-all h-10 w-10",
                copiedPix && "bg-green-500 hover:bg-green-600 text-white",
              )}
              title="Copiar PIX"
            >
              {copiedPix ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-amber-700/60 dark:text-amber-400/60 mt-1 font-medium">
            Qualquer valor é super bem-vindo! ❤️
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
