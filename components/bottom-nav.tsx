"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { logout } from "@/app/actions/auth";
import {
  Home,
  Calendar,
  StickyNote,
  BarChart3,
  Settings,
  User,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
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
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/calendar", icon: Calendar, label: "Calendário" },
  { href: "/notes", icon: StickyNote, label: "Notas" },
  { href: "/stats", icon: BarChart3, label: "Estatísticas" },
];

interface ResponsiveNavProps {
  userName?: string;
  avatarSeed?: string | null;
}

export function ResponsiveNav({ userName, avatarSeed }: ResponsiveNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom
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

      {/* Container com scroll horizontal no mobile */}
      <div className="flex h-16 w-full items-center justify-between overflow-x-auto no-scrollbar px-2 md:h-full md:flex-col md:justify-start md:gap-2 md:px-3 lg:px-4 md:overflow-visible md:pb-6">
        {/* --- Links Principais --- */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col md:flex-row items-center md:justify-center lg:justify-start gap-1 md:gap-4 px-3 md:px-4 py-2 md:py-3 md:w-full md:rounded-xl transition-colors group shrink-0",
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

              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "scale-110 md:scale-100 transition-transform" : "",
                )}
              />
              <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* --- Ações do Usuário --- */}
        <div className="hidden md:block mt-auto" />
        <div className="hidden md:block w-full h-px bg-border/50 my-2" />

        <button className={actionItemClass}>
          <Settings className="h-5 w-5" />
          <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">
            Config.
          </span>
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={actionItemClass}
        >
          <div className="relative h-5 w-5 flex items-center justify-center">
            <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">
            Tema
          </span>
        </button>

        {/* Perfil com o Fun Emoji */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={actionItemClass}>
              <img
                src={avatarUrl}
                alt={`Avatar`}
                className="h-6 w-6 rounded-full bg-primary/10 object-cover"
              />
              <span className="text-[10px] md:hidden lg:block lg:text-sm font-medium">
                Perfil
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={16}
            className="w-56"
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-10 w-10 rounded-full bg-primary/10"
              />
              <div>
                <p className="text-sm font-medium leading-none mb-1">
                  {userName || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground">Bem-vindo(a)!</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Editar Perfil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Saindo..." : "Sair da conta"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
