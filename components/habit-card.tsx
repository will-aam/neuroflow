"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toggleHabitCompletion, deleteHabit } from "@/app/actions/habits";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/db";

interface HabitCardProps {
  habit: Habit;
  date: string;
  isCompleted: boolean;
}

export function HabitCard({
  habit,
  date,
  isCompleted: initialCompleted,
}: HabitCardProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const controls = useAnimation();

  const handleToggle = () => {
    if (isPending || isDragging) return;

    const newState = !completed;
    setCompleted(newState);

    if (newState) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    }

    startTransition(async () => {
      await toggleHabitCompletion(habit.id, date, newState);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteHabit(habit.id);
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: any, info: any) => {
    setIsDragging(false);
    const swipeThreshold = 100;

    if (info.offset.x > swipeThreshold) {
      await controls.start({ x: 500, opacity: 0 });
      handleDelete();
    } else {
      controls.start({ x: 0 });
    }
  };

  const dopamineWeight = Array.from(
    { length: habit.dopamine_weight },
    (_, i) => i,
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
      className="relative mb-3 rounded-xl"
    >
      {/* Background da Lixeira (SÓ aparece enquanto está arrastando) */}
      <div
        className={cn(
          "absolute inset-0 bg-rose-500 rounded-xl flex items-center justify-start px-6 z-0 transition-opacity duration-200",
          isDragging ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="material-icons text-white">delete</span>
      </div>

      {/* Card principal */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.7 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 touch-pan-y w-full h-full"
      >
        <Card
          className={cn(
            "relative overflow-hidden transition-colors duration-300 cursor-pointer h-full",
            completed
              ? "bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
              : "hover:border-primary/50 bg-background",
          )}
          onClick={handleToggle}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <motion.div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                  completed
                    ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : "border-muted-foreground/30",
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
                      <span className="material-icons text-base text-white leading-none">
                        check
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-medium transition-all duration-300",
                      completed && "line-through text-muted-foreground",
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
                  {dopamineWeight.map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "material-icons text-xs leading-none transition-colors",
                        completed
                          ? "text-amber-500 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]"
                          : "text-muted-foreground/30",
                      )}
                    >
                      bolt
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Efeito de Luz Brilhante (Glow / Shine) */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                {/* Glow de fundo esverdeado */}
                <div className="absolute inset-0 bg-emerald-400/10 blur-md" />

                {/* Feixe de luz passando da esquerda para a direita */}
                <motion.div
                  className="absolute top-0 bottom-0 w-24 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                  initial={{ left: "-50%" }}
                  animate={{ left: "150%" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
