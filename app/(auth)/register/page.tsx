"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Brain, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup, type AuthState } from "@/app/actions/auth"

const initialState: AuthState = {}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const passwordChecks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
  }

  const isPasswordValid = password.length === 0 || Object.values(passwordChecks).every(Boolean)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Brain className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-muted-foreground">
            Comece sua jornada de hábitos hoje
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Como quer ser chamado?"
              autoComplete="name"
              className="h-12"
            />
          </div>

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
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1 pt-2"
              >
                <PasswordCheck checked={passwordChecks.length} label="Mínimo 8 caracteres" />
                <PasswordCheck checked={passwordChecks.letter} label="Pelo menos uma letra" />
                <PasswordCheck checked={passwordChecks.number} label="Pelo menos um número" />
              </motion.div>
            )}
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
            disabled={isPending || !isPasswordValid}
            className="w-full h-12 text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Seus dados estão seguros. Privacidade é prioridade.
        </p>
      </motion.div>
    </div>
  )
}

function PasswordCheck({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
        checked ? "bg-green-500 text-white" : "bg-muted"
      }`}>
        {checked && <Check className="h-3 w-3" />}
      </div>
      <span className={checked ? "text-muted-foreground" : "text-muted-foreground/60"}>
        {label}
      </span>
    </div>
  )
}
