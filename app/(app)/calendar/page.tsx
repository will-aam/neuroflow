"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AddEventDialog } from "@/components/add-event-dialog";
import { PushNotificationManager } from "@/components/push-notification-manager";

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
  const [deletingEvent, setDeletingEvent] = useState<any | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const selectedDateString = selectedDate?.toISOString().split("T")[0];

  // Busca os hábitos do dia
  const { data: dayData } = useSWR(
    selectedDateString ? `/api/habits?date=${selectedDateString}` : null,
    fetcher,
  );

  // Busca todos os eventos/compromissos do usuário
  const { data: eventsData } = useSWR("/api/events", fetcher);

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

  // Filtra os eventos apenas para o dia selecionado
  const selectedDayEvents =
    eventsData?.filter((e: any) => {
      if (!selectedDate) return false;
      const eventDate = new Date(e.event_date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    }) || [];

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    try {
      const response = await fetch(`/api/events/${deletingEvent.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        mutate("/api/events");
      }
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
    } finally {
      setDeletingEvent(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6 md:pl-24 lg:pl-64 transition-all">
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
              <span className="material-icons text-xl leading-none">
                chevron_left
              </span>
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
              <span className="material-icons text-xl leading-none">
                chevron_right
              </span>
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

              // Verifica se tem evento nesse dia para mostrar uma bolinha indicadora
              const hasEvent = eventsData?.some((e: any) => {
                const eDate = new Date(e.event_date);
                return (
                  eDate.getDate() === day.getDate() &&
                  eDate.getMonth() === day.getMonth() &&
                  eDate.getFullYear() === day.getFullYear()
                );
              });

              return (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-colors relative",
                    isSelected && "bg-primary text-primary-foreground",
                    isToday && !isSelected && "bg-primary/10 text-primary",
                    !isSelected && !isToday && "hover:bg-muted",
                  )}
                >
                  <span>{day.getDate()}</span>
                  {hasEvent && (
                    <span
                      className={cn(
                        "absolute bottom-1.5 w-1 h-1 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-orange-500",
                      )}
                    />
                  )}
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

            {/* SEÇÃO DE COMPROMISSOS */}
            {selectedDayEvents.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Compromissos
                </h4>
                {selectedDayEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <span className="material-icons text-base leading-none">
                          event
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {event.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.event_date).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                          {event.notify_before > 0 && (
                            <>
                              {" "}
                              • Lembrete{" "}
                              {event.notify_before >= 60
                                ? `${event.notify_before / 60}h`
                                : `${event.notify_before}m`}{" "}
                              antes
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => setDeletingEvent(event)}
                    >
                      <span className="material-icons text-lg">delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* SEÇÃO DE HÁBITOS */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Hábitos
              </h4>
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
                            <span className="material-icons text-base text-white leading-none">
                              check
                            </span>
                          ) : (
                            <span className="material-icons text-base text-muted-foreground leading-none">
                              close
                            </span>
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
            </div>

            {/* BOTÃO PARA ADICIONAR NOVO COMPROMISSO */}
            <AddEventDialog selectedDate={selectedDate} />
          </motion.div>
        )}
        <PushNotificationManager />
      </main>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog
        open={!!deletingEvent}
        onOpenChange={(open) => {
          if (!open) setDeletingEvent(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compromisso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-foreground">
                {deletingEvent?.title}
              </span>
              ? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
