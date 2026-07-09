"use client"

import * as React from "react"
import { ComputedSetup, DeconstructedSetup } from "@/lib/data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubOperationCard } from "./SubOperationCard"

interface SetupCardProps {
  computedSetup: ComputedSetup
  deconstructedSetup: DeconstructedSetup
}

export function SetupCard({ computedSetup, deconstructedSetup }: SetupCardProps) {
  // Determine color for the sequence circle based on machine family
  const isInspection = computedSetup.machine_family.toLowerCase().includes("inspection")
  const isHeatTreat = computedSetup.machine_family.toLowerCase().includes("heat")
  const isBench = computedSetup.machine_family.toLowerCase().includes("bench")
  
  let circleColor = "border-primary text-primary" // default green/primary
  if (isInspection) circleColor = "border-blue-500 text-blue-500"
  if (isHeatTreat) circleColor = "border-orange-500 text-orange-500"
  if (isBench) circleColor = "border-amber-600 text-amber-600"

  const hasSubOps = computedSetup.sub_operations && computedSetup.sub_operations.length > 0

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Main operation header — prominent background */}
      <CardHeader className="bg-muted/30 pb-4 border-b">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${circleColor}`}>
              {computedSetup.sequence}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{computedSetup.setup_name}</h3>
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                  {computedSetup.machine_family.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Right side times */}
          <div className="text-right">
            <div className="text-sm font-mono text-foreground font-semibold">
              {computedSetup.time_summary.total_machining_time_min.toFixed(2)} min <span className="text-muted-foreground font-normal font-sans">cycle</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5">
              {computedSetup.time_summary.setup_time_min.toFixed(2)} min <span className="font-sans">setup</span>
            </div>
          </div>
        </div>

        {/* Subtitle / Metadata Row */}
        {deconstructedSetup && (
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 ml-11">
            {deconstructedSetup.workholding && (
              <div><span className="font-semibold uppercase tracking-wider">Workholding:</span> {deconstructedSetup.workholding.method}</div>
            )}
            {deconstructedSetup.datum_references && deconstructedSetup.datum_references.length > 0 && (
              <div><span className="font-semibold uppercase tracking-wider">Datums:</span> {deconstructedSetup.datum_references.join(", ")}</div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Description */}
        {deconstructedSetup && (
          <div className="px-6 py-4 border-b bg-background">
            <p className="text-sm leading-relaxed text-foreground">
              {deconstructedSetup.machine_reason || 
               `${deconstructedSetup.stock_state_before} → ${deconstructedSetup.stock_state_after}`}
            </p>
          </div>
        )}

        {/* Sub-operations — shown directly, each individually expandable */}
        {hasSubOps && (
          <div className="bg-muted/5">
            {computedSetup.sub_operations.map((subOp) => {
              const deconstructedSubOp = deconstructedSetup?.sub_operations?.find(
                (d) => d.sub_op_id === subOp.sub_op_id
              )
              return (
                <SubOperationCard 
                  key={subOp.sub_op_id} 
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
