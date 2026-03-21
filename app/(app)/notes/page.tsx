"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, StickyNote, Lightbulb } from "lucide-react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function NotesPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [content, setContent] = useState("")
  const [reminder, setReminder] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const dateString = currentDate.toISOString().split("T")[0]
  
  const { data, mutate } = useSWR(
    `/api/notes?date=${dateString}`,
    fetcher,
    {
      onSuccess: (data) => {
        if (data.note) {
          setContent(data.note.content || "")
          setReminder(data.note.reminder_for_tomorrow || "")
        } else {
          setContent("")
          setReminder("")
        }
        setHasChanges(false)
      }
    }
  )

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    if (newDate <= new Date()) {
      setCurrentDate(newDate)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return
    
    setIsSaving(true)
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateString,
          content: content.trim(),
          reminderForTomorrow: reminder.trim() || null
        })
      })
      mutate()
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    if (compareDate.getTime() === today.getTime()) {
      return "Hoje"
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (compareDate.getTime() === yesterday.getTime()) {
      return "Ontem"
    }

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  }

  const isToday = currentDate.toDateString() === new Date().toDateString()
  const yesterdayReminder = data?.yesterdayReminder

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Date navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDay(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground capitalize">
              {formatDate(currentDate)}
            </h2>
            <p className="text-sm text-muted-foreground">{dateString}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDay(1)}
            disabled={isToday}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Yesterday's reminder */}
        {isToday && yesterdayReminder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Lembrete de ontem
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {yesterdayReminder}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Note editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <StickyNote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notas do dia</h3>
              <p className="text-xs text-muted-foreground">
                Registre seus pensamentos e sentimentos
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">O que aconteceu hoje?</Label>
            <Textarea
              id="content"
              placeholder="Escreva sobre seu dia, como você se sentiu, o que aprendeu..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setHasChanges(true)
              }}
              className="min-h-[150px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">Lembrete para amanhã (opcional)</Label>
            <Textarea
              id="reminder"
              placeholder="Algo que você quer lembrar amanhã..."
              value={reminder}
              onChange={(e) => {
                setReminder(e.target.value)
                setHasChanges(true)
              }}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !content.trim() || !hasChanges}
            className="w-full"
          >
            {isSaving ? "Salvando..." : hasChanges ? "Salvar nota" : "Salvo"}
          </Button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
