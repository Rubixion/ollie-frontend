"use client";

// 21st.dev: uiable/questionnaire (one question per screen, skippable, progress), restyled to the Ollie look.
import * as React from "react";

import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { Questionnaire as QuestionnairePrimitive } from "@shadcn/react/questionnaire";
import { cn } from "@/lib/utils";

import { CheckIcon } from "lucide-react";

type Look = Pick<ButtonProps, "size" | "variant">;

function Questionnaire({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Root>) {
  return (
    <QuestionnairePrimitive.Root
      data-slot="questionnaire"
      className={cn("flex w-full min-w-0 flex-col gap-4", className)}
      {...props}
    />
  );
}

function QuestionnaireProgress({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Progress>) {
  return (
    <QuestionnairePrimitive.Progress
      data-slot="questionnaire-progress"
      className={cn(
        "min-h-[1lh] w-fit min-w-[14ch] text-xs font-semibold text-white/60 tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnaireItem({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Item> & {
  multiple?: boolean;
}) {
  return (
    <QuestionnairePrimitive.Item
      data-slot="questionnaire-item"
      data-multiple={props.multiple ? "" : undefined}
      className={cn(
        "flex min-w-0 flex-col gap-4 border-0 p-0 outline-none",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnaireTitle({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Title>) {
  return (
    <QuestionnairePrimitive.Title
      data-slot="questionnaire-title"
      className={cn(
        "text-lg leading-snug font-bold text-white text-balance [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnaireDescription({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Description>) {
  return (
    <QuestionnairePrimitive.Description
      data-slot="questionnaire-description"
      className={cn("text-sm text-pretty text-white/60", className)}
      {...props}
    />
  );
}

function QuestionnaireChoices({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices>) {
  return (
    <QuestionnairePrimitive.Choices
      data-slot="questionnaire-choices"
      className={cn(
        "group/questionnaire-choices grid min-w-0 gap-2",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnaireChoice({
  children,
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice>) {
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        "group/questionnaire-choice relative flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-start text-sm text-white/80 transition-colors outline-none select-none hover:bg-white/[0.05] has-[>input:focus-visible]:outline-2 has-[>input:focus-visible]:outline-offset-2 has-[>input:focus-visible]:outline-(--ollie-cyan) data-invalid:border-red-400/60 data-checked:border-(--ollie-cyan) data-checked:bg-(--ollie-cyan)/10 data-checked:text-white [&:has([data-slot=questionnaire-choice-description])]:items-start",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        className={cn(
          "pointer-events-none relative flex size-4 shrink-0 items-center justify-center border border-white/30 text-black transition-colors",
          "group-data-checked/questionnaire-choice:border-(--ollie-cyan) group-data-checked/questionnaire-choice:bg-(--ollie-cyan)",
          "group-has-[[data-slot=questionnaire-choice-description]]/questionnaire-choice:mt-0.5",
          // Default: Radio
          "rounded-full",
          // Checkbox Override
          "[[data-multiple]_&]:rounded-[4px]",
        )}
      >
        <span
          data-slot="questionnaire-choice-indicator-dot"
          className={cn(
            "hidden size-1.5 rounded-full bg-black group-data-checked/questionnaire-choice:block",
            "[[data-multiple]_&]:!hidden",
          )}
        />
        <CheckIcon
          data-slot="questionnaire-choice-indicator-check"
          className="hidden size-3.5 group-data-checked/questionnaire-choice:[[data-multiple]_&]:block"
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        className="pointer-events-none ms-auto hidden size-5 shrink-0 items-center justify-center rounded-md border border-white/15 bg-black font-mono text-[0.625rem] leading-none font-medium text-white/60 group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </QuestionnairePrimitive.Choice>
  );
}

function QuestionnaireChoiceDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="questionnaire-choice-description"
      className={cn("text-white/60", className)}
      {...props}
    />
  );
}

function QuestionnaireInput({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input>) {
  return (
    <div
      data-slot="questionnaire-input-wrapper"
      className="group/questionnaire-input relative w-full min-w-0"
    >
      <QuestionnairePrimitive.Input
        data-slot="questionnaire-input"
        className={cn(
          "min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-black/35 px-3 py-1 text-base text-white transition-[color,box-shadow,background-color] outline-none focus-visible:border-(--ollie-cyan) disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-400/60",
          "selection:bg-(--ollie-cyan) selection:text-black placeholder:text-white/40",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function QuestionnaireError({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Error>) {
  return (
    <QuestionnairePrimitive.Error
      data-slot="questionnaire-error"
      className={cn("mt-2 text-sm text-red-300", className)}
      {...props}
    />
  );
}

function QuestionnaireActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="questionnaire-actions"
      className={cn(
        "flex min-h-11 w-full items-center justify-end gap-2",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnairePrevious({
  children,
  className,
  size = "cta",
  variant = "brandOutline",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Previous> & Look) {
  return (
    <QuestionnairePrimitive.Previous
      data-slot="questionnaire-previous"
      className={cn(buttonVariants({ size, variant }), "mr-auto", className)}
      {...props}
    >
      {children ?? "Back"}
    </QuestionnairePrimitive.Previous>
  );
}

function QuestionnaireSkip({
  children,
  className,
  size = "cta",
  variant = "ghost",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Skip> & Look) {
  return (
    <QuestionnairePrimitive.Skip
      data-slot="questionnaire-skip"
      className={cn(buttonVariants({ size, variant }), "text-white/70 hover:bg-white/[0.05] hover:text-white", className)}
      {...props}
    >
      {children ?? "Skip"}
    </QuestionnairePrimitive.Skip>
  );
}

function QuestionnaireNext({
  children,
  className,
  size = "cta",
  variant = "brand",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Next> & Look) {
  return (
    <QuestionnairePrimitive.Next
      data-slot="questionnaire-next"
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    >
      {children ?? "Next"}
    </QuestionnairePrimitive.Next>
  );
}

function QuestionnaireSubmit({
  children,
  className,
  size = "cta",
  variant = "brand",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Submit> & Look) {
  return (
    <QuestionnairePrimitive.Submit
      data-slot="questionnaire-submit"
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    >
      {children ?? "Submit"}
    </QuestionnairePrimitive.Submit>
  );
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
