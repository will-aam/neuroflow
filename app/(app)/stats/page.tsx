"use client"

import useSWR from "swr"
import { motion } from "framer-motion"
import { TrendingUp, Flame, Target, Award } from "lucide-react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function StatsPage() {
  const { data: statsData } = useSWR("/api/stats", fetcher)

  const stats = statsData || {
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyCompletion: 0,
    totalCompletions: 0
  }

  const statCards = [
    {
      icon: Target,
      label: "Hábitos ativos",
      value: stats.totalHabits,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      icon: Flame,
      label: "Sequência atual",
      value: `${stats.currentStreak} dias`,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
      icon: Award,
      label: "Melhor sequência",
      value: `${stats.bestStreak} dias`,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      icon: TrendingUp,
      label: "Taxa semanal",
      value: `${stats.weeklyCompletion}%`,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-2">Suas estatísticas</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso e celebre suas conquistas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-card p-4 shadow-sm border border-border"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">Dica do dia</h3>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lembre-se: consistência é mais importante que perfeição. 
              Um pequeno passo todo dia vale mais que grandes saltos ocasionais. 
              Seja gentil consigo mesmo!
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20"
        >
          <h3 className="font-semibold text-foreground mb-2">Total de conquistas</h3>
          <p className="text-4xl font-bold text-primary mb-1">{stats.totalCompletions}</p>
          <p className="text-sm text-muted-foreground">hábitos completados no total</p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
