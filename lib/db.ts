import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  energy_mode: "good" | "difficult" | "chaos";
  theme: "light" | "dark" | "system";
  avatar_seed?: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: "daily" | "weekly" | "custom";
  phase: "morning" | "afternoon" | "night";
  dopamine_weight: number;
  is_mini_habit: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export type DailyLog = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  completed_at: Date | null;
  energy_mode: "good" | "difficult" | "chaos";
  created_at: Date;
};

export type DailyNote = {
  id: string;
  user_id: string;
  date: string;
  content: string;
  reminder_for_tomorrow: string | null;
  created_at: Date;
  updated_at: Date;
};
// Adicione isso no final do seu arquivo lib/db.ts

export type Event = {
  id: string;
  user_id: string;
  title: string;
  event_date: Date;
  notify_before: number; // Tempo em minutos (ex: 1440 para 1 dia antes)
  is_notified: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PushSubscription = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: Date;
};
