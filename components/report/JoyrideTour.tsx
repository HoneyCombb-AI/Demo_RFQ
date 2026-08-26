"use client"

import * as React from "react"
import {
  Joyride,
  EVENTS,
  type EventData,
  type Step,
  type TooltipRenderProps,
} from "react-joyride"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
} from "lucide-react"

interface StepData {
  subtitle?: string
  icon?: React.ReactNode
}

export interface TourStepDef {
  target: string
  targetTab?: string
  placement: Step["placement"]
  title: string
  subtitle?: string
  icon: React.ReactNode
  content: string
}

function TourTooltip({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const { subtitle, icon } = (step.data ?? {}) as StepData

  return (
    <div
      {...tooltipProps}
      className="w-full max-w-md bg-background/95 backdrop-blur-md border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header Ribbon */}
      <div className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
            {icon ?? <Sparkles className="w-4 h-4 text-amber-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-mono tracking-wider text-amber-600 border-amber-500/30 bg-amber-50 px-1.5 py-0"
              >
                Honeycomb AI
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono">
                {index + 1}/{size}
              </span>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-foreground mt-0.5">
              {step.title}
            </h3>
          </div>
        </div>

        <Button
          {...closeProps}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Body */}
      <div className="px-5 py-3.5 space-y-2">
        {subtitle && (
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">
            {subtitle}
          </p>
        )}

        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
          {step.content}
        </p>

        {/* Progress Indicator Dots */}
        <div className="flex items-center justify-center gap-1 pt-1.5">
          {Array.from({ length: size }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === index
                  ? "w-5 bg-amber-500"
                  : "w-1.5 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-2.5 bg-muted/40 border-t flex items-center justify-between">
        <Button
          {...skipProps}
          variant="ghost"
          size="sm"
          className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          Skip Tour
        </Button>

        <div className="flex items-center gap-1.5">
          {index > 0 && (
            <Button {...backProps} variant="outline" size="sm" className="text-[11px] h-7 px-2.5">
              <ChevronLeft className="w-3 h-3 mr-1" />
              Prev
            </Button>
          )}

          <Button
            {...primaryProps}
            size="sm"
            className="text-[11px] h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
          >
            {isLastStep ? (
              <>
                Complete
                <CheckCircle2 className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface JoyrideTourProps {
  isOpen: boolean
  onClose: () => void
  onTabChange?: (tab: string) => void
  stepDefs: TourStepDef[]
}

export function JoyrideTour({ isOpen, onClose, onTabChange, stepDefs }: JoyrideTourProps) {
  const steps = React.useMemo<Step[]>(
    () =>
      stepDefs.map((def) => ({
        target: def.target,
        placement: def.placement,
        title: def.title,
        content: def.content,
        data: { subtitle: def.subtitle, icon: def.icon } satisfies StepData,
        skipBeacon: true,
        // The tab bar is sticky and always in view, and the welcome/closing
        // steps target `body`, so neither ever needs a scroll animation.
        skipScroll: def.target === "body" || Boolean(def.targetTab),
        before: def.targetTab
          ? async () => {
              onTabChange?.(def.targetTab as string)
              // Give the tab panel a moment to mount before Joyride looks for its target.
              await new Promise((resolve) => setTimeout(resolve, 200))
            }
          : undefined,
      })),
    [onTabChange, stepDefs]
  )

  const handleEvent = React.useCallback(
    (data: EventData) => {
      if (data.type === EVENTS.TOUR_END) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <Joyride
      run={isOpen}
      steps={steps}
      continuous
      scrollToFirstStep
      tooltipComponent={TourTooltip}
      onEvent={handleEvent}
      options={{
        overlayColor: "rgba(0, 0, 0, 0.5)",
        overlayClickAction: false,
        spotlightPadding: 6,
        spotlightRadius: 10,
        targetWaitTimeout: 2000,
        zIndex: 60,
      }}
    />
  )
}
