"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, StickyNote, BarChart3, Droplet } from "lucide-react"; // Adicionei um ícone de logo fictício
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/calendar", icon: Calendar, label: "Calendário" },
  { href: "/notes", icon: StickyNote, label: "Notas" },
  { href: "/stats", icon: BarChart3, label: "Estatísticas" },
];

export function ResponsiveNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 safe-area-inset-bottom
      md:top-0 md:right-auto md:w-24 lg:w-64 md:border-t-0 md:border-r md:h-screen md:flex md:flex-col transition-all duration-300"
    >
      {/* Logo exclusivo para Desktop */}
      <div className="hidden md:flex items-center justify-center lg:justify-start lg:px-8 h-20 border-b border-border/50 w-full mb-6">
        <Droplet className="h-8 w-8 text-primary" />
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight">
          Neuroflow
        </span>
      </div>

      <div className="flex h-16 items-center justify-around px-4 md:h-auto md:flex-col md:gap-4 md:px-3 lg:px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col md:flex-row items-center md:justify-center lg:justify-start gap-1 md:gap-4 px-4 py-2 md:py-3 md:w-full md:rounded-xl transition-colors group",
                isActive
                  ? "text-primary md:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground md:hover:bg-muted",
              )}
            >
              {/* Indicador Mobile (Top) */}
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary md:hidden"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              {/* Indicador Desktop (Left) - Opcional, como adicionamos bg-primary/10, pode omitir, mas fica charmoso */}
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
              {/* Oculta o texto em tablets (md) e exibe no mobile e computadores maiores (lg) */}
              <span className="text-xs font-medium md:hidden lg:block lg:text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
