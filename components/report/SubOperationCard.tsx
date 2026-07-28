"use client"

import * as React from "react"
import { ComputedSubOp, DeconstructedSubOp } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { ParamBadge } from "./ParamBadge"
import { ChevronRight, ChevronDown } from "lucide-react"

interface SubOperationCardProps {
  subOp: ComputedSubOp
  deconstructedSubOp?: DeconstructedSubOp
}

/**
 * Checks whether a parameter value is meaningful enough to display.
 * Filters out: null, undefined, empty strings, 0 (numeric), false (boolean).
 * Keeps: non-zero numbers, non-empty strings, true booleans.
 */
function isMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false
  if (typeof value === "number" && value === 0) return false
  if (typeof value === "boolean" && value === false) return false
  return true
}

/**
 * Keys within cutting_parameters that should never render as a badge
 * because they are better expressed as a textual note (e.g. rpm_capped)
 * or are internal housekeeping fields.
 */
const CUTTING_PARAM_SKIP_KEYS = new Set(["rpm_capped"])

/**
 * Format a cutting-parameter key into a human-readable label with units
 * embedded where appropriate.
 */
function formatCuttingParamLabel(key: string): string {
  const MAP: Record<string, string> = {
    cutting_speed_m_min: "CUTTING SPEED M/MIN",
    rpm: "RPM",
    feed_per_rev_mm: "FEED PER REV MM",
    feed_per_tooth_mm: "FEED PER TOOTH MM",
    feed_rate_mm_min: "FEED RATE MM/MIN",
    flute_count: "FLUTE COUNT",
    tool_diameter_mm: "TOOL DIAMETER MM",
    step_over_mm: "STEP OVER MM",
    depth_per_pass_mm: "DEPTH PER PASS MM",
    number_of_passes: "NUMBER OF PASSES",
    reversal_factor: "REVERSAL FACTOR",
  }
  return MAP[key] || key.replace(/_/g, " ").toUpperCase()
}

export function SubOperationCard({ subOp, deconstructedSubOp }: SubOperationCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const seqNumber = subOp.sequence.toString().padStart(2, "0")

  // Build filtered formula-input entries (only meaningful values)
  const formulaEntries = subOp.formula_inputs_used
    ? Object.entries(subOp.formula_inputs_used).filter(([, value]) => isMeaningfulValue(value))
    : []

  // Build filtered cutting-parameter entries (only meaningful, non-skipped values)
  const cuttingEntries = subOp.cycle_time?.cutting_parameters
    ? Object.entries(subOp.cycle_time.cutting_parameters).filter(
        ([key, value]) => !CUTTING_PARAM_SKIP_KEYS.has(key) && isMeaningfulValue(value)
      )
    : []

  const hasDetails = !!(
    deconstructedSubOp?.reason ||
    formulaEntries.length > 0 ||
    cuttingEntries.length > 0 ||
    (subOp.cycle_time?.calculation_notes && subOp.cycle_time.calculation_notes.length > 0)
  )

  return (
    <div className="border-b last:border-0">
      {/* Compact top-level row */}
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
          hasDetails ? "cursor-pointer hover:bg-muted/40" : "cursor-default"
        } ${expanded ? "bg-muted/30" : ""}`}
      >
        {/* Expand icon */}
        <div className="w-4 shrink-0">
          {hasDetails && (
            expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Sequence number */}
        <span className="text-xs font-mono font-bold text-muted-foreground w-5 shrink-0">{seqNumber}</span>

        {/* Operation name + feature IDs */}
        <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-sm text-foreground">{subOp.operation_name}</span>
          <div className="flex gap-1 flex-wrap">
            {subOp.target_feature_ids.map((id) => (
              <Badge key={id} variant="secondary" className="font-mono text-[10px] px-1.5 py-0 bg-muted/60">
                {id}
              </Badge>
            ))}
          </div>
        </div>

        {/* Operation type + time */}
        <div className="flex items-center gap-4 shrink-0 ml-auto">
          {subOp.operation_type && (
            <span className="text-xs text-muted-foreground capitalize">{subOp.operation_type.replace(/_/g, " ")}</span>
          )}
          <span className="text-sm font-mono font-semibold whitespace-nowrap">
            {subOp.cycle_time?.total_time_min?.toFixed(2)} min
          </span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="ml-12 mr-5 pb-4 pt-1 space-y-4 border-l-2 border-muted pl-4">
          {/* Reason */}
          {deconstructedSubOp?.reason && (
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Reason</h5>
              <p className="text-sm text-foreground">{deconstructedSubOp.reason}</p>
            </div>
          )}

          {/* Formula Inputs — only non-null, non-zero, non-false values */}
          {formulaEntries.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Formula Inputs</h5>
              <div className="flex flex-wrap gap-2">
                {formulaEntries.map(([key, value]) => {
                  const label = key.replace(/_/g, " ").toUpperCase()
                  return <ParamBadge key={key} label={label} value={value as string | number} />
                })}
              </div>
            </div>
          )}

          {/* Cutting Parameters — only meaningful computed values */}
          {cuttingEntries.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Cutting Parameters</h5>
              <div className="flex flex-wrap gap-2">
                {cuttingEntries.map(([key, value]) => {
                  const label = formatCuttingParamLabel(key)
                  return <ParamBadge key={key} label={label} value={value as string | number} />
                })}
              </div>
            </div>
          )}

          {/* Calculation Notes */}
          {subOp.cycle_time?.calculation_notes && subOp.cycle_time.calculation_notes.length > 0 && (
            <div className="text-xs italic text-muted-foreground">
              {subOp.cycle_time.calculation_notes.map((note, idx) => (
                <p key={idx}>{note}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
