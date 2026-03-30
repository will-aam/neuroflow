"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, User as UserIcon } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { updateAvatar } from "@/app/actions/profile"; // A server action que criamos!

// Uma lista de "sementes" que geram avatares únicos e divertidos no DiceBear
const AVATAR_OPTIONS = [
  "Felix",
  "Aneka",
  "Jasper",
  "Zoey",
  "Max",
  "Lily",
  "Buster",
  "Coco",
  "Oliver",
  "Chloe",
  "Milo",
  "Bella",
  "Simba",
  "Nala",
  "Loki",
  "Luna",
];

interface AvatarClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar_seed: string | null;
  };
}

export function AvatarClient({ user }: AvatarClientProps) {
  // Se o usuário não tiver seed salva, usa o nome dele ou o padrão
  const currentSeed = user.avatar_seed || user.name || "Neuroflow";

  const [selectedSeed, setSelectedSeed] = useState<string>(currentSeed);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasChanges = selectedSeed !== currentSeed;

  const handleSave = async () => {
    setIsSaving(true);
    setShowSuccess(false);

    const result = await updateAvatar(selectedSeed);

    setIsSaving(false);
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Esconde a mensagem após 3s
    } else {
      alert("Houve um erro ao salvar seu avatar.");
    }
  };

  const generateAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6 md:pl-24 lg:pl-64 transition-all">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-foreground">Seu Perfil</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha um avatar que combine com o seu humor.
          </p>
        </motion.div>

        {/* Galeria de Avatares */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border space-y-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 overflow-hidden bg-primary/5 shrink-0 relative">
              <img
                src={generateAvatarUrl(selectedSeed)}
                alt="Avatar selecionado"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {user.name || "Usuário"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {AVATAR_OPTIONS.map((seed) => {
              const isSelected = selectedSeed === seed;
              return (
                <button
                  key={seed}
                  onClick={() => setSelectedSeed(seed)}
                  className={`relative aspect-square rounded-full transition-all overflow-hidden ${
                    isSelected
                      ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110 z-10"
                      : "hover:scale-105 hover:ring-2 hover:ring-primary/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={generateAvatarUrl(seed)}
                    alt={`Avatar ${seed}`}
                    className="w-full h-full object-cover bg-primary/5"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      {/* Efeito sutil sobre a foto selecionada */}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {hasChanges
                ? "Você tem alterações não salvas."
                : "Seu avatar atual."}
            </p>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="w-32 transition-all"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : showSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvo!
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
