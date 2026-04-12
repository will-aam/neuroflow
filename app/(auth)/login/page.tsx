"use client";

import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
<<<<<<< HEAD
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
              <span className="material-icons text-3xl leading-none">psychology</span>
            </div>
          </div>
=======
          <div className="flex justify-center"></div>
>>>>>>> 2e5de51 (Implement event management API with GET and POST endpoints, including database setup for events table)
          <h1 className="text-2xl font-bold text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground">
            Entre na sua conta para continuar
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <span className="material-icons text-xl leading-none">visibility_off</span>
                ) : (
                  <span className="material-icons text-xl leading-none">visibility</span>
                )}
              </button>
            </div>
          </div>

          {state.error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive text-center"
            >
              {state.error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 text-base"
          >
            {isPending ? (
              <>
                <span className="material-icons text-base mr-2 animate-spin leading-none">autorenew</span>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Criar conta
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Sem pressão. Seu ritmo, suas regras.
        </p>
      </motion.div>
    </div>
  );
}
