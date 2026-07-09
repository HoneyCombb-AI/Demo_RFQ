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

export function SubOperationCard({ subOp, deconstructedSubOp }: SubOperationCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const seqNumber = subOp.sequence.toString().padStart(2, "0")

  const hasDetails = !!(
    deconstructedSubOp?.reason ||
    (subOp.formula_inputs_used && Object.keys(subOp.formula_inputs_used).length > 0) ||
    subOp.cycle_time?.cutting_parameters ||
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

          {/* Formula Inputs */}
          {subOp.formula_inputs_used && Object.keys(subOp.formula_inputs_used).length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Formula Inputs</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(subOp.formula_inputs_used).map(([key, value]) => {
                  if (value === null || value === undefined) return null;
                  const label = key.replace(/_/g, " ").toUpperCase()
                  return <ParamBadge key={key} label={label} value={value as string | number} />
                })}
              </div>
            </div>
          )}

          {/* Cutting Parameters */}
          {subOp.cycle_time?.cutting_parameters && (
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Cutting Parameters</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(subOp.cycle_time.cutting_parameters).map(([key, value]) => {
                  if (value === null || value === undefined) return null;
                  const label = key.replace(/_/g, " ").toUpperCase()
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
