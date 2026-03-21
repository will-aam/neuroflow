"use client"

import { AnimatePresence } from "framer-motion"
import { Sunrise, Sun, Moon } from "lucide-react"
import { HabitCard } from "./habit-card"
import type { Habit, DailyLog } from "@/lib/db"

const phases = [
  { id: "morning", label: "Manhã - Ativar o Cérebro", icon: Sunrise },
  { id: "afternoon", label: "Tarde - Produção Leve", icon: Sun },
  { id: "night", label: "Noite - Desacelerar", icon: Moon },
] as const

interface HabitsListProps {
  habits: Habit[]
  logs: DailyLog[]
  date: string
  energyMode: "good" | "difficult" | "chaos"
}

export function HabitsList({ habits, logs, date, energyMode }: HabitsListProps) {
  const completedIds = new Set(logs.filter((l) => l.completed).map((l) => l.habit_id))

  // Filter habits based on energy mode
  const filteredHabits = habits.filter((habit) => {
    if (energyMode === "good") return true
    if (energyMode === "difficult") return habit.is_mini_habit
    if (energyMode === "chaos") return habit.is_mini_habit && habit.dopamine_weight <= 2
    return true
  })

  const habitsByPhase = phases.map((phase) => ({
    ...phase,
    habits: filteredHabits.filter((h) => h.phase === phase.id),
  }))

  const totalHabits = filteredHabits.length
  const completedCount = filteredHabits.filter((h) => completedIds.has(h.id)).length
  const progressPercent = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso do dia</span>
          <span className="font-medium">
            {completedCount}/{totalHabits}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {completedCount > 0 && completedCount === totalHabits && (
          <p className="text-center text-sm text-emerald-600 font-medium">
            Parabéns! Você completou todas as tarefas do dia!
          </p>
        )}
        {completedCount > 0 && completedCount < totalHabits && (
          <p className="text-center text-xs text-muted-foreground">
            Cada passo conta. Sem pressa, sem culpa.
          </p>
        )}
      </div>

      {/* Habits by phase */}
      {habitsByPhase.map((phase) => {
        if (phase.habits.length === 0) return null
        const Icon = phase.icon

        return (
          <div key={phase.id} className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <h2 className="text-sm font-medium">{phase.label}</h2>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {phase.habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    date={date}
                    isCompleted={completedIds.has(habit.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )
      })}

      {filteredHabits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum hábito para este modo.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione novos hábitos ou mude o modo de energia.
          </p>
        </div>
      )}
    </div>
  )
}
