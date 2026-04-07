import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const habitSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
  phase: z.enum(["morning", "afternoon", "night"]).default("morning"),
  dopamine_weight: z.number().min(1).max(5).default(1),
  is_mini_habit: z.boolean().default(false),
})

export const dailyNoteSchema = z.object({
  date: z.string(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  reminder_for_tomorrow: z.string().optional(),
})

export const energyModeSchema = z.enum(["good", "difficult", "chaos"])

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type HabitInput = z.infer<typeof habitSchema>
export type DailyNoteInput = z.infer<typeof dailyNoteSchema>
export type EnergyMode = z.infer<typeof energyModeSchema>
