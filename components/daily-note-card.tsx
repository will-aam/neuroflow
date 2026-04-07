"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { saveDailyNote } from "@/app/actions/notes"
import type { DailyNote } from "@/lib/db"

interface DailyNoteCardProps {
  date: string
  note: DailyNote | null
  yesterdayReminder: string | null
}

export function DailyNoteCard({ date, note, yesterdayReminder }: DailyNoteCardProps) {
  const [content, setContent] = useState(note?.content || "")
  const [reminder, setReminder] = useState(note?.reminder_for_tomorrow || "")
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const formData = new FormData()
    formData.set("date", date)
    formData.set("content", content)
    formData.set("reminder_for_tomorrow", reminder)

    startTransition(async () => {
      await saveDailyNote(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="material-icons text-base text-amber-500 leading-none">sticky_note_2</span>
          Bloquinho de Anotações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {yesterdayReminder && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <span className="material-icons text-base text-amber-500 mt-0.5 flex-shrink-0 leading-none">error</span>
            <div>
              <p className="text-xs font-medium text-amber-600">Lembrete de ontem:</p>
              <p className="text-sm text-foreground">{yesterdayReminder}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm">
            O que aconteceu hoje?
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Anote o que precisa lembrar..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder" className="text-sm">
            Lembrete para amanhã
          </Label>
          <Textarea
            id="reminder"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="O que você não pode esquecer amanhã?"
            rows={2}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || !content.trim()}
          className="w-full"
          variant={saved ? "default" : "secondary"}
        >
          {isPending ? (
            "Salvando..."
          ) : saved ? (
            <>
              <span className="material-icons text-base mr-2 leading-none">save</span>
              Salvo!
            </>
          ) : (
            "Salvar Anotações"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
