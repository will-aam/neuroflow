"use client"

import { Button } from "@/components/ui/button"
import { updateEnergyMode } from "@/app/actions/habits"
import { useTransition, useState } from "react"
import { cn } from "@/lib/utils"

type EnergyMode = "good" | "difficult" | "chaos"

const modes = [
  {
    id: "good" as const,
    label: "Dia Bom",
    icon: "local_fire_department",
    description: "Rotina completa",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
    activeColor: "bg-emerald-500 text-white border-emerald-600",
  },
  {
    id: "difficult" as const,
    label: "Dia Difícil",
    icon: "water_drop",
    description: "Apenas mini-hábitos",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20",
    activeColor: "bg-amber-500 text-white border-amber-600",
  },
  {
    id: "chaos" as const,
    label: "Modo Caos",
    icon: "bolt",
    description: "Rotina express",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20",
    activeColor: "bg-rose-500 text-white border-rose-600",
  },
]

interface EnergyModeSelectorProps {
  currentMode: EnergyMode
}

export function EnergyModeSelector({ currentMode }: EnergyModeSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [activeMode, setActiveMode] = useState<EnergyMode>(currentMode)

  const handleModeChange = (mode: EnergyMode) => {
    setActiveMode(mode)
    startTransition(async () => {
      await updateEnergyMode(mode)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Como você está hoje?</p>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id

          return (
            <Button
              key={mode.id}
              variant="outline"
              disabled={isPending}
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 transition-all",
                isActive ? mode.activeColor : mode.color
              )}
            >
              <span className="material-icons text-xl leading-none">{mode.icon}</span>
              <span className="text-xs font-medium">{mode.label}</span>
            </Button>
          )
        })}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {modes.find((m) => m.id === activeMode)?.description}
      </p>
    </div>
  )
}
