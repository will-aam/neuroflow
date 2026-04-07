// Componente principal do dashboard, que integra os outros componentes e gerencia o estado global da página
"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";

import { EnergyModeSelector } from "@/components/energy-mode-selector";
import { HabitsList } from "@/components/habits-list";
import { DopamineProgress } from "@/components/dopamine-progress";
import { DailyNoteCard } from "@/components/daily-note-card";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { CelebrationOverlay } from "@/components/celebration-overlay";
import { WeekNavigator } from "@/components/week-navigator";

interface User {
  id: string;
  name: string;
  email: string;
  energy_mode: "good" | "difficult" | "chaos";
}

interface DashboardProps {
  user: User;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Dashboard({ user }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [energyMode, setEnergyMode] = useState<"good" | "difficult" | "chaos">(
    user.energy_mode,
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const dateString = selectedDate.toISOString().split("T")[0];

  const { data: habitsData } = useSWR(
    `/api/habits?date=${dateString}`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const { data: noteData } = useSWR(`/api/notes?date=${dateString}`, fetcher, {
    revalidateOnFocus: false,
  });

  const habits = habitsData?.habits || [];
  const logs = habitsData?.logs || [];
  const note = noteData?.note;

  const completedCount = logs.filter(
    (log: { completed: boolean }) => log.completed,
  ).length;
  const totalCount = habits.length;

  const dopaminePoints = logs
    .filter((log: { completed: boolean }) => log.completed)
    .reduce((acc: number, log: { habit_id: string }) => {
      const habit = habits.find((h: { id: string }) => h.id === log.habit_id);
      return acc + (habit?.dopamine_weight || 1);
    }, 0);

  const maxDopaminePoints = habits.reduce(
    (acc: number, h: { dopamine_weight: number }) =>
      acc + (h.dopamine_weight || 1),
    0,
  );

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    // Removido o pb-20 fixo e ajustado para dar margem à sidebar no desktop
    <div className="min-h-screen bg-background pb-24 md:pb-6 md:pl-24 lg:pl-64 transition-all">
      {/* Adicionado max-w-7xl e mx-auto para centralizar em monitores ultrawide */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <WeekNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </motion.div>

        {/* Início do Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUNA ESQUERDA (Ocupa 8 de 12 colunas no Desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {isToday && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <EnergyModeSelector
                  currentMode={energyMode}
                  onModeChange={setEnergyMode} // <-- ADICIONADO AQUI: Passa a função para atualizar o estado
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Seus hábitos
                </h2>
                <AddHabitDialog />
              </div>
              <HabitsList
                habits={habits}
                logs={logs}
                date={dateString}
                energyMode={energyMode}
              />
            </motion.div>
          </div>

          {/* COLUNA DIREITA (Ocupa 4 de 12 colunas no Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
              transition={{ delay: 0.4 }}
            >
              <DailyNoteCard
                date={dateString}
                note={note}
                yesterdayReminder={""}
              />
            </motion.div>
          </div>
        </div>
      </main>

      <CelebrationOverlay
        show={showCelebration}
        message={celebrationMessage}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
