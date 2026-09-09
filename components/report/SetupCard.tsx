"use client"

import * as React from "react"
import { ComputedSetup, DeconstructedSetup } from "@/lib/data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SubOperationCard } from "./SubOperationCard"
import { AVAILABLE_MACHINES, getMachineMeta } from "@/lib/engineer-workflow"
import { ArrowUp, ArrowDown, Trash2, SlidersHorizontal, Sparkles } from "lucide-react"

interface SetupCardProps {
  computedSetup: ComputedSetup
  deconstructedSetup?: DeconstructedSetup
  sequenceIndex?: number
  totalSetups?: number
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDelete?: () => void
  onMachineChange?: (newFamily: string) => void
  isEdited?: boolean
  isCustom?: boolean
  currentHourlyRate?: number
  currentCycleTimeSec?: number
}

export function SetupCard({
  computedSetup,
  deconstructedSetup,
  sequenceIndex = 0,
  totalSetups = 1,
  onMoveUp,
  onMoveDown,
  onDelete,
  onMachineChange,
  isEdited = false,
  isCustom = false,
  currentHourlyRate,
  currentCycleTimeSec,
}: SetupCardProps) {
  // Determine color for the sequence circle based on machine family
  const familyLower = computedSetup.machine_family?.toLowerCase() ?? ""
  const isInspection = familyLower.includes("inspection") || familyLower.includes("cmm")
  const isHeatTreat = familyLower.includes("heat")
  const isBench = familyLower.includes("bench") || familyLower.includes("finish")
  const isHmc = familyLower.includes("hmc") || familyLower.includes("bmc")

  let circleColor = "border-primary text-primary" // default green/primary
  if (isInspection) circleColor = "border-blue-500 text-blue-500"
  if (isHeatTreat) circleColor = "border-orange-500 text-orange-500"
  if (isBench) circleColor = "border-amber-600 text-amber-600"
  if (isHmc) circleColor = "border-purple-600 text-purple-600"

  const hasSubOps = computedSetup.sub_operations && computedSetup.sub_operations.length > 0
  const machineMeta = getMachineMeta(computedSetup.machine_family)
  const hourlyRate = currentHourlyRate ?? machineMeta.defaultHourlyRate
  const cycleTimeSec = currentCycleTimeSec ?? (computedSetup.time_summary?.total_machining_time_min != null ? computedSetup.time_summary.total_machining_time_min * 60 : 45)
  const cycleTimeMin = cycleTimeSec / 60
  const pieceCost = (cycleTimeSec / 3600) * hourlyRate

  return (
    <Card className={`mb-6 overflow-hidden transition-all duration-200 ${
      isEdited ? "border-amber-500/40 shadow-sm" : isCustom ? "border-primary/40 shadow-sm" : ""
    }`}>
      {/* Main operation header — prominent background */}
      <CardHeader className="bg-muted/30 pb-4 border-b">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <div className="flex items-start gap-3">
            {/* Step Sequence Circle */}
            <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm bg-background ${circleColor}`}>
              {computedSetup.sequence}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold tracking-tight">{computedSetup.setup_name}</h3>
                {isEdited && (
                  <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40">
                    <SlidersHorizontal className="w-2.5 h-2.5 mr-1" />
                    ENGINEER OVERRIDE
                  </Badge>
                )}
                {isCustom && (
                  <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0.5 bg-primary/10 text-primary border-primary/40">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    CUSTOM PROCESS
                  </Badge>
                )}
              </div>

              {/* Interactive Machine Dropdown */}
              <div className="flex items-center gap-2 pt-0.5">
                <label className="text-[11px] uppercase font-mono font-semibold text-muted-foreground">Machine:</label>
                {onMachineChange ? (
                  <select
                    value={computedSetup.machine_family}
                    onChange={(e) => onMachineChange(e.target.value)}
                    className="text-xs bg-background border border-border/80 rounded-md px-2.5 py-1 font-mono font-medium text-foreground hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer shadow-2xs"
                  >
                    {AVAILABLE_MACHINES.map((m) => (
                      <option key={m.family} value={m.family}>
                        {m.displayName} (₹{m.defaultHourlyRate}/hr)
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-mono">
                    {computedSetup.machine_family.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right side times & sequence controls */}
          <div className="flex items-center justify-between sm:justify-end gap-5">
            <div className="text-right">
              <div className="text-sm font-mono text-foreground font-semibold">
                {cycleTimeMin.toFixed(2)} min{" "}
                <span className="text-muted-foreground font-normal font-sans text-xs">({cycleTimeSec.toFixed(1)}s)</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">
                ₹{pieceCost.toFixed(2)}/pc{" "}
                <span className="text-[10px] text-muted-foreground/80 font-sans">@ ₹{hourlyRate}/hr</span>
              </div>
            </div>

            {/* Reorder and Delete Controls */}
            {(onMoveUp || onMoveDown || onDelete) && (
              <div className="flex items-center gap-1 bg-background/80 border rounded-md p-0.5 shrink-0 shadow-2xs">
                {onMoveUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={sequenceIndex === 0}
                    onClick={onMoveUp}
                    title="Move Step Earlier (Up)"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={sequenceIndex === totalSetups - 1}
                    onClick={onMoveDown}
                    title="Move Step Later (Down)"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                    onClick={onDelete}
                    title="Remove Operation from Route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subtitle / Metadata Row */}
        {deconstructedSetup && (
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 ml-11">
            {deconstructedSetup.workholding && (
              <div>
                <span className="font-semibold uppercase tracking-wider text-muted-foreground/90">Workholding:</span>{" "}
                {deconstructedSetup.workholding.method || deconstructedSetup.workholding.grip_description || "Standard Fixture"}
              </div>
            )}
            {deconstructedSetup.datum_references && deconstructedSetup.datum_references.length > 0 && (
              <div>
                <span className="font-semibold uppercase tracking-wider text-muted-foreground/90">Datums:</span>{" "}
                {deconstructedSetup.datum_references.join(", ")}
              </div>
            )}
            <div>
              <span className="font-semibold uppercase tracking-wider text-muted-foreground/90">Type:</span>{" "}
              {computedSetup.in_house ? "In-House" : "Outside Process"}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Description / Setup Note */}
        {deconstructedSetup && (
          <div className="px-6 py-3.5 border-b bg-background">
            <p className="text-sm leading-relaxed text-foreground/90">
              {deconstructedSetup.machine_reason ||
                `${deconstructedSetup.stock_state_before || "Stock Blank"} → ${deconstructedSetup.stock_state_after || "Finished Contour"}`}
            </p>
          </div>
        )}

        {/* Sub-operations — shown directly, each individually expandable */}
        {hasSubOps && (
          <div className="bg-muted/5">
            {computedSetup.sub_operations.map((subOp, idx) => {
              const deconstructedSubOp = deconstructedSetup?.sub_operations?.find(
                (d) => d.sub_op_id === subOp.sub_op_id
              )
              return (
                <SubOperationCard
                  key={subOp.sub_op_id || `sub-${subOp.sequence || idx}-${idx}`}
                  subOp={subOp}
                  deconstructedSubOp={deconstructedSubOp}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
