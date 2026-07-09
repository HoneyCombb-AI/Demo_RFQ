import * as React from "react"
import { cn } from "@/lib/utils"

interface ParamBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number | null | undefined
  unit?: string
}

export function ParamBadge({
  label,
  value,
  unit,
  className,
  ...props
}: ParamBadgeProps) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 px-3 py-1 text-xs font-mono shadow-sm transition-colors",
        className
      )}
      {...props}
    >
      <span className="font-medium text-muted-foreground uppercase mr-1.5">{label}</span>
      <span className="font-bold text-foreground">
        {value}
        {unit && <span className="ml-1 text-muted-foreground font-normal">{unit}</span>}
      </span>
    </div>
  )
}
