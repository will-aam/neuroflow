"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Início" },
  { href: "/calendar", icon: "calendar_month", label: "Calendário" },
  { href: "/notes", icon: "sticky_note_2", label: "Notas" },
  { href: "/stats", icon: "bar_chart", label: "Estatísticas" },
];

interface ResponsiveNavProps {
  userName?: string;
  avatarSeed?: string | null;
}

export function ResponsiveNav({ userName, avatarSeed }: ResponsiveNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Evita erro de hidratação com o tema
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const actionItemClass =
    "relative flex flex-col md:flex-row items-center md:justify-center lg:justify-start gap-1 md:gap-4 px-3 md:px-4 py-2 md:py-3 md:w-full md:rounded-xl transition-colors group text-muted-foreground hover:text-foreground md:hover:bg-muted shrink-0 cursor-pointer bg-transparent border-none";

  const seedToUse = avatarSeed || userName || "Neuroflow";
  const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(
    seedToUse,
  )}`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 safe-area-inset-bottom
      md:top-0 md:right-auto md:w-24 lg:w-64 md:border-t-0 md:border-r md:h-screen flex md:flex-col transition-all duration-300"
    >
      {/* Logo exclusivo para Desktop */}
      <div className="hidden md:flex items-center justify-center lg:justify-start lg:px-8 h-20 border-b border-border/50 w-full mb-6 shrink-0">
        <div className="relative h-8 w-8 shrink-0">
          <Image
            src="/neuroflow.png"
            alt="Logo Neuroflow"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight">
          Neuroflow
        </span>
      </div>

      {/* Container: No mobile divide o espaço igualmente (justify-around), no desktop empilha */}
      <div className="flex h-16 w-full items-center justify-around px-2 md:h-full md:flex-col md:justify-start md:gap-2 md:px-3 lg:px-4 md:pb-6">
        {/* --- Links Principais --- */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col md:flex-row items-center md:justify-center lg:justify-start gap-1 md:gap-4 px-2 md:px-4 py-2 md:py-3 md:w-full md:rounded-xl transition-colors group shrink-0",
                isActive
                  ? "text-primary md:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground md:hover:bg-muted",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary md:hidden"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabDesktop"
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}

              <span
                className={cn(
                  "material-icons text-2xl md:text-xl leading-none",
                  isActive ? "scale-110 md:scale-100 transition-transform" : "",
                )}
              >
                {item.icon}
              </span>
              <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* --- Ações do Usuário --- */}
        <div className="hidden md:block mt-auto" />
        <div className="hidden md:block w-full h-px bg-border/50 my-2" />

        {/* Perfil com o Fun Emoji (Agora contém as Configurações e Tema) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(actionItemClass, "px-2")}>
              <div className="relative h-7 w-7 md:h-6 md:w-6 rounded-full border-2 border-primary/20 hover:border-primary transition-colors">
                <img
                  src={avatarUrl}
                  alt={`Avatar`}
                  className="h-full w-full rounded-full bg-primary/10 object-cover"
                />
              </div>
              <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium mt-0.5">
                Perfil
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={16}
            className="w-56 rounded-xl"
          >
            <div className="flex items-center gap-3 px-2 py-3">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-10 w-10 rounded-full bg-primary/10"
              />
              <div className="flex flex-col">
                <p className="text-sm font-semibold leading-none mb-1">
                  {userName || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground">Bem-vindo(a)!</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Opção de Editar Perfil */}
            <DropdownMenuItem asChild className="rounded-md">
              <Link href="/profile" className="w-full cursor-pointer py-2">
                <span className="material-icons mr-2 text-base leading-none">
                  person
                </span>
                Editar Perfil
              </Link>
            </DropdownMenuItem>

            {/* Opção de Configurações */}
            {/* <DropdownMenuItem className="cursor-pointer py-2">
              <span className="material-icons mr-2 text-base leading-none">
                settings
              </span>
              Configurações
            </DropdownMenuItem> */}

            {/* Opção de Mudar Tema */}
            <DropdownMenuItem
              className="cursor-pointer py-2"
              onClick={(e) => {
                e.preventDefault(); // Impede o menu de fechar ao clicar
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              {mounted && theme === "dark" ? (
                <>
                  <span className="material-icons mr-2 text-base leading-none text-amber-500">
                    light_mode
                  </span>
                  Modo Claro
                </>
              ) : (
                <>
                  <span className="material-icons mr-2 text-base leading-none text-blue-500">
                    dark_mode
                  </span>
                  Modo Escuro
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Sair */}
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive cursor-pointer py-2 rounded-md"
            >
              <span className="material-icons mr-2 text-base leading-none">
                logout
              </span>
              {isLoggingOut ? "Saindo..." : "Sair da conta"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
