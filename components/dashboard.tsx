"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { EnergyModeSelector } from "@/components/energy-mode-selector";
import { HabitsList } from "@/components/habits-list";
import { DopamineProgress } from "@/components/dopamine-progress";
import { DailyNoteCard } from "@/components/daily-note-card";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { CelebrationOverlay } from "@/components/celebration-overlay";
import { WeekNavigator } from "@/components/week-navigator";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const { data: habitsData, mutate: mutateHabits } = useSWR(
    `/api/habits?date=${dateString}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const { data: noteData, mutate: mutateNote } = useSWR(
    `/api/notes?date=${dateString}`,
    fetcher,
    { revalidateOnFocus: false },
  );

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

  // Removidas as funções de handle, pois os componentes filhos gerenciam suas próprias Server Actions.

  const isToday = selectedDate.toDateString() === new Date().toDateString();

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
            {/* O componente original não aceita onModeChange, pois ele mesmo atualiza via Server Action */}
            <EnergyModeSelector currentMode={energyMode} />
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
            <h2 className="text-lg font-semibold text-foreground">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <DailyNoteCard
            date={dateString}
            note={note}
            yesterdayReminder={""} // Passando string vazia caso não haja lógica para isso ainda
          />
        </motion.div>
      </main>

      <BottomNav />

      <CelebrationOverlay
        show={showCelebration}
        message={celebrationMessage}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
