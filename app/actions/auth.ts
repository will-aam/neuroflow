// app/actions/auth.ts
"use server";

import { sql } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: boolean;
};

// Sign up / Register new user
export async function signup(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;
  const displayName = name ?? email.split("@")[0];

  // Check if user exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return { error: "Este email já está cadastrado" };
  }

  const passwordHash = await hashPassword(password);

  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${displayName})
    RETURNING id
  `;

  await createSession(result[0].id);
  redirect("/dashboard");
}

// Alias - register is same as signup
export const register = signup;

// Login existing user
export async function login(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;

  const users = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (users.length === 0) {
    return { error: "Email ou senha incorretos" };
  }

  const user = users[0];
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Email ou senha incorretos" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

// Logout user
export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
