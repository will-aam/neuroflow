"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { createHabit } from "@/app/actions/habits";
import { cn } from "@/lib/utils";
import { mutate } from "swr"; // <-- ADICIONADO AQUI

const phases = [
  { id: "morning", label: "Manhã", icon: "wb_twilight" },
  { id: "afternoon", label: "Tarde", icon: "wb_sunny" },
  { id: "night", label: "Noite", icon: "nightlight" },
] as const;

export function AddHabitDialog() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"morning" | "afternoon" | "night">(
    "morning",
  );
  const [dopamineWeight, setDopamineWeight] = useState([2]);
  const [isMiniHabit, setIsMiniHabit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    formData.set("phase", phase);
    formData.set("dopamine_weight", dopamineWeight[0].toString());
    formData.set("is_mini_habit", isMiniHabit.toString());

    startTransition(async () => {
      const result = await createHabit(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
        setPhase("morning");
        setDopamineWeight([2]);
        setIsMiniHabit(false);

        // <-- ADICIONADO AQUI: Avisa o SWR para recarregar todos os hábitos imediatamente
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/habits"),
          undefined,
          { revalidate: true },
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <span className="material-icons text-base mr-1 leading-none">
            add
          </span>
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Hábito</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Beber água ao acordar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalhes adicionais..."
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Período do dia</Label>
            <div className="grid grid-cols-3 gap-2">
              {phases.map((p) => {
                const isSelected = phase === p.id;

                return (
                  <Button
                    key={p.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-3 transition-all",
                      !isSelected &&
                        "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setPhase(p.id)}
                  >
                    <span className="material-icons text-base leading-none">
                      {p.icon}
                    </span>
                    <span className="text-xs">{p.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Peso de Dopamina</Label>
              <span className="text-sm text-muted-foreground">
                {dopamineWeight[0]}/5
              </span>
            </div>
            <Slider
              value={dopamineWeight}
              onValueChange={setDopamineWeight}
              min={1}
              max={5}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Quanto maior o peso, maior a recompensa visual ao completar.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mini">Mini-hábito</Label>
              <p className="text-xs text-muted-foreground">
                Aparece em todos os modos de energia
              </p>
            </div>
            <Switch
              id="mini"
              checked={isMiniHabit}
              onCheckedChange={setIsMiniHabit}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Criando..." : "Criar Hábito"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
