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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mutate } from "swr";

interface AddEventDialogProps {
  selectedDate: Date;
}

export function AddEventDialog({ selectedDate }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [notifyBefore, setNotifyBefore] = useState("0");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    // Configura a data do evento
    const eventDate = new Date(selectedDate);
    // Define um horário padrão (meio-dia) para evitar problemas de fuso horário,
    // futuramente você pode adicionar um seletor de hora se ela pedir!
    eventDate.setHours(12, 0, 0, 0);

    startTransition(async () => {
      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            eventDate: eventDate.toISOString(),
            notifyBefore: parseInt(notifyBefore),
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao salvar compromisso");
        }

        setOpen(false);
        setError(null);
        setNotifyBefore("0");

        // Atualiza a lista de eventos instantaneamente na tela
        mutate("/api/events");
      } catch (err: any) {
        setError(err.message || "Ocorreu um erro inesperado");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full w-full mt-4 border-dashed border-2"
        >
          <span className="material-icons text-base mr-1 leading-none">
            event
          </span>
          Agendar Compromisso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Compromisso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título do Compromisso</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Consulta Médica"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data Selecionada</Label>
            <div className="p-3 bg-muted rounded-md text-sm font-medium text-muted-foreground capitalize">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lembrar-me</Label>
            <Select value={notifyBefore} onValueChange={setNotifyBefore}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione quando ser lembrado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No momento exato</SelectItem>
                <SelectItem value="15">15 minutos antes</SelectItem>
                <SelectItem value="60">1 hora antes</SelectItem>
                <SelectItem value="1440">1 dia antes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              O aplicativo enviará uma notificação no seu dispositivo.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Compromisso"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
