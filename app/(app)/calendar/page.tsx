"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Header } from "@/components/header";
// ❌ REMOVIDO: import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const selectedDateString = selectedDate?.toISOString().split("T")[0];

  const { data: dayData } = useSWR(
    selectedDateString ? `/api/habits?date=${selectedDateString}` : null,
    fetcher,
  );

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(year, month + direction, 1));
    setSelectedDate(null);
  };

  const habits = dayData?.habits || [];
  const logs = dayData?.logs || [];
  const completedCount = logs.filter(
    (l: { completed: boolean }) => l.completed,
  ).length;

  return (
    // ✅ ADICIONADO: Margens para a sidebar no Desktop (md:pl-24 lg:pl-64)
    <div className="min-h-screen bg-background pb-24 md:pb-6 md:pl-24 lg:pl-64 transition-all">
      <Header />

      {/* ✅ ADICIONADO: max-w-7xl e mx-auto para centralizar em telas grandes */}
      <main className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {MONTHS[month]} {year}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(1)}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isToday = day.getTime() === today.getTime();
              const isSelected = selectedDate?.getTime() === day.getTime();
              const isFuture = day > today;

              return (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isFuture && setSelectedDate(day)}
                  disabled={isFuture}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-colors",
                    isSelected && "bg-primary text-primary-foreground",
                    isToday && !isSelected && "bg-primary/10 text-primary",
                    !isSelected && !isToday && !isFuture && "hover:bg-muted",
                    isFuture && "text-muted-foreground/40 cursor-not-allowed",
                  )}
                >
                  {day.getDate()}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected day details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-6 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{habits.length} hábitos
              </span>
            </div>

            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum hábito registrado neste dia
              </p>
            ) : (
              <div className="space-y-2">
                {habits.map((habit: { id: string; title: string }) => {
                  const log = logs.find(
                    (l: { habit_id: string }) => l.habit_id === habit.id,
                  );
                  const isCompleted = log?.completed;

                  return (
                    <div
                      key={habit.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl",
                        isCompleted
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted-foreground/20",
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm",
                          isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {habit.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ❌ REMOVIDO: <BottomNav /> - Pois ela agora está no layout.tsx global */}
    </div>
  );
}
