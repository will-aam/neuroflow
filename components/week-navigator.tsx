"use client";

import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WeekNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// Array com os nomes abreviados do jeito exato que você precisa
const SHORT_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WeekNavigator({
  selectedDate,
  onDateChange,
}: WeekNavigatorProps) {
  const today = new Date();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Começa na segunda (Monday)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addDays(selectedDate, direction === "prev" ? -7 : 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(today);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek("prev")}
        >
          <span className="material-icons text-base leading-none">chevron_left</span>
        </Button>
        <button
          onClick={goToToday}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          {format(weekStart, "MMMM yyyy", { locale: ptBR })}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek("next")}
        >
          <span className="material-icons text-base leading-none">chevron_right</span>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isTodayDate
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
              )}
            >
              {/* Usando o array SHORT_DAYS pelo índice da semana (0 = Dom, 1 = Seg...) */}
              <span className="text-[10px] font-medium">
                {SHORT_DAYS[day.getDay()]}
              </span>
              <span
                className={cn(
                  "text-lg font-semibold",
                  isSelected && "text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {!isToday(selectedDate) && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={goToToday}
        >
          Ir para Hoje
        </Button>
      )}
    </div>
  );
}
