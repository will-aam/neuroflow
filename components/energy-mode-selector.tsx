"use client";

import { Button } from "@/components/ui/button";
import { updateEnergyMode } from "@/app/actions/habits";
import { useTransition, useState } from "react";
import { cn } from "@/lib/utils";

type EnergyMode = "good" | "difficult" | "chaos";

const modes = [
  {
    id: "good" as const,
    label: "Dia Bom",
    icon: "local_fire_department",
    description: "Rotina completa",
    color:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
    activeColor: "bg-emerald-500 text-white border-emerald-600",
  },
  {
    id: "difficult" as const,
    label: "Dia Difícil",
    icon: "water_drop",
    description: "Apenas mini-hábitos",
    color:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20",
    activeColor: "bg-amber-500 text-white border-amber-600",
  },
  {
    id: "chaos" as const,
    label: "Modo Caos",
    icon: "bolt",
    description: "Rotina express",
    color:
      "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20",
    activeColor: "bg-rose-500 text-white border-rose-600",
  },
];

interface EnergyModeSelectorProps {
  currentMode: EnergyMode | null;
  alreadySelectedToday?: boolean;
  onModeChange?: (mode: EnergyMode) => void; // <-- Propriedade adicionada para avisar o Dashboard
}

export function EnergyModeSelector({
  currentMode,
  alreadySelectedToday = false,
  onModeChange, // <-- Recebendo a nova propriedade
}: EnergyModeSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [activeMode, setActiveMode] = useState<EnergyMode | null>(currentMode);
  // Estado para controlar se os botões devem ser bloqueados
  const [isLocked, setIsLocked] = useState(alreadySelectedToday);

  const handleModeChange = (mode: EnergyMode) => {
    if (isLocked) return; // Previne execução se já estiver bloqueado

    setActiveMode(mode);
    setIsLocked(true); // Bloqueia imediatamente após o primeiro clique

    // <-- Avisa o Dashboard sobre a mudança para atualizar os hábitos na mesma hora
    if (onModeChange) {
      onModeChange(mode);
    }

    startTransition(async () => {
      await updateEnergyMode(mode);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Como você está hoje?</p>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;

          return (
            <Button
              key={mode.id}
              variant="outline"
              disabled={isPending || isLocked} // Desabilita se estiver carregando ou se já escolheu
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 transition-all",
                isActive ? mode.activeColor : mode.color,
                // Deixa as opções não escolhidas mais opacas quando bloqueado
                isLocked && !isActive
                  ? "opacity-50 grayscale cursor-not-allowed"
                  : "",
              )}
            >
              <span className="material-icons text-xl leading-none">
                {mode.icon}
              </span>
              <span className="text-xs font-medium">{mode.label}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {activeMode
          ? modes.find((m) => m.id === activeMode)?.description
          : "Selecione o seu modo de energia para hoje."}
      </p>

      {/* Mensagem amigável avisando que a escolha foi salva */}
      {isLocked && (
        <p className="text-[10px] text-center text-muted-foreground italic">
          Seleção salva para hoje. Volte amanhã para atualizar.
        </p>
      )}
    </div>
  );
}
