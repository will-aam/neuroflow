"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, addDays, startOfWeek, isToday, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface WeekNavigatorProps {
  currentDate: string
}

export function WeekNavigator({ currentDate }: WeekNavigatorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const today = new Date()
  const selectedDate = parseISO(currentDate)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const navigateToDate = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("date", format(date, "yyyy-MM-dd"))
    router.push(`/dashboard?${params.toString()}`)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addDays(selectedDate, direction === "prev" ? -7 : 7)
    navigateToDate(newDate)
  }

  const goToToday = () => {
    navigateToDate(today)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateWeek("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          onClick={goToToday}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          {format(weekStart, "MMMM yyyy", { locale: ptBR })}
        </button>
        <Button variant="ghost" size="icon" onClick={() => navigateWeek("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => navigateToDate(day)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isTodayDate
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
              )}
            >
              <span className="text-[10px] uppercase">
                {format(day, "EEE", { locale: ptBR })}
              </span>
              <span className={cn("text-lg font-semibold", isSelected && "text-primary-foreground")}>
                {format(day, "d")}
              </span>
            </button>
          )
        })}
      </div>

      {!isToday(selectedDate) && (
        <Button variant="outline" size="sm" className="w-full" onClick={goToToday}>
          Ir para Hoje
        </Button>
      )}
    </div>
  )
}
