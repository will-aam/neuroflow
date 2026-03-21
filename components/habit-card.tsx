"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles, Trash2, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toggleHabitCompletion, deleteHabit } from "@/app/actions/habits"
import { cn } from "@/lib/utils"
import type { Habit } from "@/lib/db"

interface HabitCardProps {
  habit: Habit
  date: string
  isCompleted: boolean
}

export function HabitCard({ habit, date, isCompleted: initialCompleted }: HabitCardProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newState = !completed
    setCompleted(newState)

    if (newState) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1500)
    }

    startTransition(async () => {
      await toggleHabitCompletion(habit.id, date, newState)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteHabit(habit.id)
    })
  }

  const dopamineStars = Array.from({ length: habit.dopamine_weight }, (_, i) => i)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all cursor-pointer group",
          completed
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "hover:border-primary/50"
        )}
        onClick={handleToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                completed
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-muted-foreground/30"
              )}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "font-medium transition-all",
                    completed && "line-through text-muted-foreground"
                  )}
                >
                  {habit.title}
                </h3>
                {habit.is_mini_habit && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                    Mini
                  </span>
                )}
              </div>
              {habit.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {habit.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                {dopamineStars.map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      completed ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>

        {/* Dopamine celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 60 * Math.PI) / 180) * 60,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 60,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                >
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
