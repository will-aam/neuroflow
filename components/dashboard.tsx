"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { EnergyModeSelector } from "@/components/energy-mode-selector"
import { HabitsList } from "@/components/habits-list"
import { DopamineProgress } from "@/components/dopamine-progress"
import { DailyNoteCard } from "@/components/daily-note-card"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { CelebrationOverlay } from "@/components/celebration-overlay"
import { WeekNavigator } from "@/components/week-navigator"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name: string
  email: string
  energy_mode: "good" | "difficult" | "chaos"
}

interface DashboardProps {
  user: User
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function Dashboard({ user }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [energyMode, setEnergyMode] = useState<"good" | "difficult" | "chaos">(user.energy_mode)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState("")
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)

  const dateString = selectedDate.toISOString().split("T")[0]
  
  const { data: habitsData, mutate: mutateHabits } = useSWR(
    `/api/habits?date=${dateString}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const { data: noteData, mutate: mutateNote } = useSWR(
    `/api/notes?date=${dateString}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const habits = habitsData?.habits || []
  const logs = habitsData?.logs || []
  const note = noteData?.note

  const completedCount = logs.filter((log: { completed: boolean }) => log.completed).length
  const totalCount = habits.length

  const dopaminePoints = logs
    .filter((log: { completed: boolean }) => log.completed)
    .reduce((acc: number, log: { habit_id: string }) => {
      const habit = habits.find((h: { id: string }) => h.id === log.habit_id)
      return acc + (habit?.dopamine_weight || 1)
    }, 0)

  const maxDopaminePoints = habits.reduce(
    (acc: number, h: { dopamine_weight: number }) => acc + (h.dopamine_weight || 1), 
    0
  )

  const handleEnergyModeChange = useCallback(async (mode: "good" | "difficult" | "chaos") => {
    setEnergyMode(mode)
    await fetch("/api/user/energy-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ energyMode: mode })
    })
  }, [])

  const handleToggleHabit = useCallback(async (habitId: string, completed: boolean) => {
    await fetch("/api/habits/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date: dateString, completed })
    })
    
    mutateHabits()

    if (completed) {
      const habit = habits.find((h: { id: string }) => h.id === habitId)
      if (habit) {
        const newCompletedCount = completedCount + 1
        if (newCompletedCount === totalCount && totalCount > 0) {
          setCelebrationMessage("Dia completo!")
          setShowCelebration(true)
        } else if (habit.dopamine_weight >= 3) {
          setCelebrationMessage("Muito bem!")
          setShowCelebration(true)
        }
      }
    }
  }, [dateString, mutateHabits, habits, completedCount, totalCount])

  const handleSaveNote = useCallback(async (content: string, reminderForTomorrow?: string) => {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateString, content, reminderForTomorrow })
    })
    mutateNote()
  }, [dateString, mutateNote])

  const handleAddHabit = useCallback(async () => {
    mutateHabits()
    setIsAddHabitOpen(false)
  }, [mutateHabits])

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header userName={user.name || undefined} />
      
      <main className="container px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WeekNavigator 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
        </motion.div>

        {isToday && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EnergyModeSelector 
              currentMode={energyMode} 
              onModeChange={handleEnergyModeChange} 
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <DopamineProgress 
            completed={completedCount}
            total={totalCount}
            dopaminePoints={dopaminePoints}
            maxPoints={maxDopaminePoints}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Seus hábitos</h2>
            <Button 
              size="sm" 
              onClick={() => setIsAddHabitOpen(true)}
              className="rounded-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          <HabitsList 
            habits={habits}
            logs={logs}
            energyMode={energyMode}
            onToggleHabit={handleToggleHabit}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <DailyNoteCard 
            date={dateString}
            note={note}
            onSave={handleSaveNote}
          />
        </motion.div>
      </main>

      <BottomNav />

      <AddHabitDialog 
        open={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onSuccess={handleAddHabit}
      />

      <CelebrationOverlay 
        show={showCelebration}
        message={celebrationMessage}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  )
}
