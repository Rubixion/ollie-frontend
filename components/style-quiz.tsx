"use client"

import { useState, type FormEvent } from "react"
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireChoices,
  QuestionnaireDescription, QuestionnaireInput, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious,
  QuestionnaireProgress, QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import type { Answers } from "@/lib/style/recommend"

type Q = { name: string; title: string; hint?: string; multiple?: boolean; choices: [value: string, label: string, note?: string][] }

const AGE_GAP = 6 // the age estimate is roughly ±5 years, so smaller gaps mean nothing

// 2-inch height bands from `lo` to `hi` inches, plus "under" and "over". Value = the band's middle in cm.
const ftIn = (i: number) => `${Math.floor(i / 12)}'${i % 12}"`
const cm = (i: number) => Math.round(i * 2.54)
function heightBands(lo: number, hi: number): [string, string][] {
  const out: [string, string][] = [[String(cm(lo - 1)), `Under ${ftIn(lo)} (${cm(lo)} cm)`]]
  for (let i = lo; i < hi; i += 2) out.push([String(cm(i + 1)), `${ftIn(i)} to ${ftIn(i + 2)} (${cm(i)} to ${cm(i + 2)} cm)`])
  out.push([String(cm(hi + 1)), `Over ${ftIn(hi)} (${cm(hi)} cm)`])
  return out
}
const HEIGHTS = { male: heightBands(65, 77), female: heightBands(60, 72), other: heightBands(60, 77) }

export function StyleQuiz({ scanAge, scanGender, onDone }: {
  scanAge?: number
  scanGender?: "male" | "female"
  onDone: (a: Answers) => void
}) {
  const [age, setAge] = useState<number>()
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(scanGender)
  const minor = age !== undefined && age < 18
  const gap = age !== undefined && scanAge !== undefined && Math.abs(scanAge - age) >= AGE_GAP

  const questions: Q[] = [
    { name: "gender", title: "Your gender", hint: scanGender ? "Pre-filled from the scan. Change it if it's wrong." : undefined,
      choices: [["male", "Man"], ["female", "Woman"], ["other", "Non-binary / prefer to describe my style instead"]] },
    { name: "height", title: "How tall are you?",
      choices: HEIGHTS[gender ?? "other"] },
    { name: "texture", title: "Your natural hair texture",
      choices: [["straight", "Straight", "Lies flat, no bend"], ["wavy", "Wavy", "Loose S-shaped bends"], ["curly", "Curly", "Defined loops or ringlets"], ["coily", "Coily", "Tight coils or zig-zags"]] },
    { name: "goal", title: "What should your look do for you?",
      hint: gap ? `The scan reads you as about ${scanAge}. If you'd like your look to match your age better, pick older or younger.` : undefined,
      choices: [
        ...(minor ? [] : [["older", "Look older / more mature"] as [string, string]]),
        ["younger", "Look younger / fresher"], ["sharper", "Look sharper"], ["softer", "Look softer, more approachable"],
        ["low-effort", "Low effort"], ["stand-out", "Stand out"], ["keep", "Just the best fit for me"],
      ] },
  ]

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = <T,>(k: string) => (f.get(k) || undefined) as T | undefined
    const goal = get<Answers["goal"]>("goal")
    onDone({
      age,
      gender: get("gender"),
      height: get<string>("height") ? Number(get("height")) : undefined,
      texture: get("texture"),
      goal: minor && goal === "older" ? undefined : goal,
    })
  }

  return (
    <Questionnaire onSubmit={submit}>
      <QuestionnaireProgress />
      <QuestionnaireItem name="age">
        <QuestionnaireTitle>How old are you?</QuestionnaireTitle>
        <QuestionnaireDescription>Used to tailor the advice. It isn&apos;t stored.</QuestionnaireDescription>
        <QuestionnaireInput type="number" inputMode="numeric" min={13} max={100} placeholder="Age"
          onChange={(e) => setAge(e.currentTarget.value ? Number(e.currentTarget.value) : undefined)} />
        <QuestionnaireActions>
          <QuestionnaireSkip />
          <QuestionnaireNext />
        </QuestionnaireActions>
      </QuestionnaireItem>

      {questions.map((q, i) => (
        <QuestionnaireItem key={q.name} name={q.name} multiple={q.multiple}>
          <QuestionnaireTitle>{q.title}</QuestionnaireTitle>
          {q.hint && <QuestionnaireDescription>{q.hint}</QuestionnaireDescription>}
          <QuestionnaireChoices className={q.choices.length > 5 ? "sm:grid-cols-2" : undefined}>
            {q.choices.map(([value, label, note]) => (
              <QuestionnaireChoice key={value} value={value} defaultChecked={q.name === "gender" && value === scanGender}
                onChange={q.name === "gender" ? () => setGender(value as typeof gender) : undefined}>
                {label}
                {note && <QuestionnaireChoiceDescription>{note}</QuestionnaireChoiceDescription>}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireActions>
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            {i === questions.length - 1 ? <QuestionnaireSubmit>Open the style editor</QuestionnaireSubmit> : <QuestionnaireNext />}
          </QuestionnaireActions>
        </QuestionnaireItem>
      ))}
    </Questionnaire>
  )
}
