"use client"

import { motion } from "framer-motion"
import { Sparkles, Star, Zap } from "lucide-react"

interface DopamineProgressProps {
  completed: number
  total: number
  dopaminePoints: number
  maxPoints: number
}

export function DopamineProgress({ 
  completed, 
  total, 
  dopaminePoints, 
  maxPoints 
}: DopamineProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  const dopaminePercentage = maxPoints > 0 ? (dopaminePoints / maxPoints) * 100 : 0
  
  const getMessage = () => {
    if (completed === 0) return "Cada pequeno passo conta"
    if (percentage < 25) return "Bom começo!"
    if (percentage < 50) return "Você está indo muito bem!"
    if (percentage < 75) return "Mais da metade! Incrível!"
    if (percentage < 100) return "Quase lá!"
    return "Dia completo! Você é demais!"
  }

  const getIcon = () => {
    if (percentage === 100) return <Sparkles className="h-5 w-5" />
    if (percentage >= 50) return <Star className="h-5 w-5" />
    return <Zap className="h-5 w-5" />
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: percentage === 100 ? [1, 1.2, 1] : 1,
              rotate: percentage === 100 ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.5, repeat: percentage === 100 ? Infinity : 0, repeatDelay: 2 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            {getIcon()}
          </motion.div>
          <div>
            <p className="text-sm font-medium text-foreground">Progresso do dia</p>
            <p className="text-xs text-muted-foreground">{getMessage()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{completed}/{total}</p>
          <p className="text-xs text-muted-foreground">hábitos</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
        />
        {percentage === 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
      </div>

      {/* Dopamine points */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm text-muted-foreground">Pontos de dopamina</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            {dopaminePoints}
          </span>
          <span className="text-sm text-muted-foreground">/ {maxPoints}</span>
        </div>
      </div>

      {/* Dopamine bar */}
      <div className="relative mt-2 h-2 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${dopaminePercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
        />
      </div>
    </div>
  )
}
