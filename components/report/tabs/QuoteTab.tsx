"use client"

import * as React from "react"
import { formatCurrency, formatMachineFamily } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InteractiveSetup, QuoteCustomization, getMachineMeta } from "@/lib/engineer-workflow"
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown,
  Calculator,
  Percent,
  Coins,
  CheckCircle2,
} from "lucide-react"

interface QuoteTabProps {
  quote: any
  interactiveSetups?: InteractiveSetup[]
  onUpdateSetups?: (setups: InteractiveSetup[]) => void
  customization?: QuoteCustomization
  onUpdateCustomization?: (customization: QuoteCustomization) => void
  partMaterial?: string
}

export function QuoteTab({
  quote,
  interactiveSetups = [],
  onUpdateSetups,
  customization,
  onUpdateCustomization,
  partMaterial = "AL 6061-T6510/T6511",
}: QuoteTabProps) {
  if (!quote) return null

  const { weights, direct_cost, quantity: baseQuantity } = quote
  const quantity = baseQuantity || 100

  // Local state if not controlled externally
  const [internalCustom, setInternalCustom] = React.useState<QuoteCustomization>({
    rawMaterialRatePerKg: 320, // standard aluminium 6061 bar rate in INR/kg
    grossWeightKg: weights?.gross_weight_kg && weights.gross_weight_kg > 0 ? weights.gross_weight_kg : 0.045, // 45g
    netWeightKg: weights?.net_weight_kg && weights.net_weight_kg > 0 ? weights.net_weight_kg : 0.001,
    customMaterialCostPerPiece: undefined,
    useManualMaterialCost: false,
    scrapCreditPct: 10,
    marginPct: 20,
    factoryOverheadPct: 25,
  })

  const custom = customization || internalCustom
  const updateCustom = (newVal: Partial<QuoteCustomization>) => {
    const updated = { ...custom, ...newVal }
    if (onUpdateCustomization) {
      onUpdateCustomization(updated)
    } else {
      setInternalCustom(updated)
    }
  }

  // Baseline initial price from original quote
  const baselineFinalPrice =
    quote.pricing_summary?.final_ex_works_price_inr ??
    quote.pricing_and_duties?.final_landed_price_inr ??
    60.33

  // 1. Calculate Raw Material Cost
  const computedMaterialCost = custom.useManualMaterialCost && custom.customMaterialCostPerPiece != null
    ? custom.customMaterialCostPerPiece
    : +(custom.grossWeightKg * custom.rawMaterialRatePerKg).toFixed(2)

  // Scrap recovery credit
  const scrapWeight = Math.max(0, custom.grossWeightKg - custom.netWeightKg)
  const scrapCreditInr = +(scrapWeight * custom.rawMaterialRatePerKg * (custom.scrapCreditPct / 100)).toFixed(2)
  const netMaterialCostInr = Math.max(0, +(computedMaterialCost - scrapCreditInr).toFixed(2))

  // 2. Machining Operations: build active list from interactiveSetups if available, else from quote
  const activeOps: InteractiveSetup[] = interactiveSetups.length > 0
    ? interactiveSetups
    : (quote.machining_operations || []).map((op: any, i: number): InteractiveSetup => ({
        setup_id: `op-${op.sequence || i}`,
        sequence: op.sequence || i + 1,
        setup_name: op.operation_name,
        machine_family: op.machine_family || "vmc_3axis",
        in_house: true,
        outside_process: false,
        setup_time_min: 15,
        cycle_time_sec: op.cycle_time_sec || 45,
        hourly_rate_inr: op.hourly_rate_inr || 400,
        sub_operations_count: 1,
      }))

  // Handle inline edits to machining operations table
  const handleCycleTimeChange = (index: number, newSecStr: string) => {
    const val = parseFloat(newSecStr)
    if (isNaN(val) || val < 0) return
    const updated = [...activeOps]
    updated[index] = {
      ...updated[index],
      cycle_time_sec: val,
      is_edited: true,
    }
    if (onUpdateSetups) onUpdateSetups(updated)
  }

  const handleHourlyRateChange = (index: number, newRateStr: string) => {
    const val = parseFloat(newRateStr)
    if (isNaN(val) || val < 0) return
    const updated = [...activeOps]
    updated[index] = {
      ...updated[index],
      hourly_rate_inr: val,
      is_edited: true,
    }
    if (onUpdateSetups) onUpdateSetups(updated)
  }

  // 3. Compute Direct Machining Subtotal
  const totalMachiningCostInr = activeOps.reduce((acc: number, op: InteractiveSetup) => {
    const opCost = (op.cycle_time_sec / 3600) * op.hourly_rate_inr
    return acc + opCost
  }, 0)

  // 4. Outside processes & heat treatment
  const heatTreatmentCostInr = direct_cost?.heat_treatment_cost_inr ?? 0.04

  // 5. Direct Cost Subtotal
  const directCostSubtotalInr = +(netMaterialCostInr + totalMachiningCostInr + heatTreatmentCostInr).toFixed(2)

  // 6. Overheads, Margin & Tooling
  const toolingInr = +(directCostSubtotalInr * 0.15).toFixed(2)
  const rejectionInr = +(directCostSubtotalInr * 0.04).toFixed(2)
  const inspectionInr = +(directCostSubtotalInr * 0.035).toFixed(2)
  const packagingInr = 0.50
  const overheadAndMarginInr = +(directCostSubtotalInr * (custom.marginPct / 100 + custom.factoryOverheadPct / 100)).toFixed(2)

  // 7. Final Landed / Ex-Works Price
  const finalPrice = +(directCostSubtotalInr + toolingInr + rejectionInr + inspectionInr + packagingInr + overheadAndMarginInr).toFixed(2)
  const batchTotal = +(finalPrice * quantity).toFixed(2)

  const priceDelta = +(finalPrice - baselineFinalPrice).toFixed(2)
  const isPriceModified = Math.abs(priceDelta) > 0.05

  return (
    <div className="space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP SUMMARY METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/30 shadow-xs">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">
              Final Price / Piece
            </div>
            <div className="text-2xl font-bold font-mono text-foreground flex items-center justify-center gap-2">
              {formatCurrency(finalPrice, "INR")}
            </div>
            {isPriceModified && (
              <div className={`text-[11px] font-mono mt-1 font-semibold ${priceDelta > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {priceDelta > 0 ? `+₹${priceDelta.toFixed(2)}` : `-₹${Math.abs(priceDelta).toFixed(2)}`} vs AI baseline
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Batch Total ({quantity} pcs)
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(batchTotal, "INR")}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              Direct Base: {formatCurrency(directCostSubtotalInr * quantity, "INR")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Target Profit Margin
            </div>
            <div className="text-2xl font-bold font-mono text-foreground flex items-center justify-center gap-1">
              {custom.marginPct}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              Overhead: {custom.factoryOverheadPct}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Material Grade
            </div>
            <div className="text-sm font-bold font-mono text-foreground truncate px-1" title={partMaterial}>
              {partMaterial.split("-")[0] || partMaterial}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              Rate: ₹{custom.rawMaterialRatePerKg}/kg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 2. ENGINEER COST OVERRIDES & RAW MATERIAL INPUTS */}
      {/* ========================================================================= */}
      <Card className="border-border shadow-xs bg-linear-to-b from-card to-muted/10">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Engineer Cost Overrides &amp; Pricing Tuning
                  <Badge variant="outline" className="text-[10px] font-mono bg-background">
                    INTERACTIVE MODEL
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Fine-tune raw material rates, batch weights, and overhead markups. Numbers update the RFQ quote in real time.
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateCustom({
                  rawMaterialRatePerKg: 320,
                  grossWeightKg: 0.045,
                  useManualMaterialCost: false,
                  marginPct: 20,
                  factoryOverheadPct: 25,
                })
              }}
              className="text-xs font-mono h-8"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Cost Inputs
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Raw Material Rate per Kg */}
            <div className="space-y-1.5 p-3 rounded-lg border bg-background">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase font-mono font-semibold text-muted-foreground">
                  Material Rate (₹/kg)
                </label>
                <Coins className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono text-muted-foreground">₹</span>
                <input
                  type="number"
                  step="5"
                  min="50"
                  max="5000"
                  value={custom.rawMaterialRatePerKg}
                  onChange={(e) => updateCustom({ rawMaterialRatePerKg: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base font-mono font-bold bg-transparent border-b border-border/80 focus:border-primary focus:outline-none py-0.5"
                />
              </div>
              <div className="text-[10px] text-muted-foreground">e.g. ₹320 for AL-6061-T6</div>
            </div>

            {/* Gross Weight per Piece */}
            <div className="space-y-1.5 p-3 rounded-lg border bg-background">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase font-mono font-semibold text-muted-foreground">
                  Gross Blank Weight
                </label>
                <span className="text-xs font-mono text-muted-foreground">kg/pc</span>
              </div>
              <input
                type="number"
                step="0.005"
                min="0.001"
                value={custom.grossWeightKg}
                onChange={(e) => updateCustom({ grossWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full text-base font-mono font-bold bg-transparent border-b border-border/80 focus:border-primary focus:outline-none py-0.5"
              />
              <div className="text-[10px] text-muted-foreground font-mono">
                = {(custom.grossWeightKg * 1000).toFixed(1)} g blank stock
              </div>
            </div>

            {/* Profit Margin % */}
            <div className="space-y-1.5 p-3 rounded-lg border bg-background">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase font-mono font-semibold text-muted-foreground">
                  Target Profit Margin
                </label>
                <Percent className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={custom.marginPct}
                  onChange={(e) => updateCustom({ marginPct: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base font-mono font-bold bg-transparent border-b border-border/80 focus:border-primary focus:outline-none py-0.5"
                />
                <span className="text-sm font-mono text-muted-foreground">%</span>
              </div>
              <div className="text-[10px] text-muted-foreground">Standard shop target 15-25%</div>
            </div>

            {/* Resulting Raw Material Cost */}
            <div className="space-y-1.5 p-3 rounded-lg border bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase font-mono font-semibold text-primary">
                  Net Material Cost
                </label>
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-lg font-mono font-bold text-foreground">
                {formatCurrency(netMaterialCostInr, "INR")} <span className="text-xs font-normal text-muted-foreground">/ pc</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                Scrap credit: -₹{scrapCreditInr.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 3. MACHINING OPERATIONS & CYCLE TIME COST (INTERACTIVE TABLE) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Machining Operations &amp; Cycle Time Cost
              <Badge variant="secondary" className="font-mono text-xs">
                {activeOps.length} Operations
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Synced directly with Routing. You can adjust cycle times (seconds) and machine hourly rates (₹/hr) directly in the table.
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded border">
            Total Machining: <span className="font-bold text-foreground">{formatCurrency(totalMachiningCostInr, "INR")}</span> / pc
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/60 border-b">
              <TableRow>
                <TableHead className="w-[70px] text-xs font-semibold tracking-wider uppercase text-center font-mono">Op #</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Operation Name</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Machine Family</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right w-[140px]">Cycle Time (s)</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right w-[140px]">Rate / Hr (INR)</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right w-[120px]">Cost / pc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOps.map((op, i) => {
                const opCost = (op.cycle_time_sec / 3600) * op.hourly_rate_inr
                const isOpCustom = op.is_custom
                const isOpEdited = op.is_edited

                return (
                  <TableRow key={`quote-op-${op.setup_id}-${i}`} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs text-center font-bold text-muted-foreground">
                      {op.sequence}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{op.setup_name}</span>
                        {isOpEdited && (
                          <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                            TUNED
                          </Badge>
                        )}
                        {isOpCustom && (
                          <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 bg-primary/10 text-primary border-primary/30">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px] bg-background">
                        {formatMachineFamily(op.machine_family)}
                      </Badge>
                    </TableCell>

                    {/* Editable Cycle Time */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={op.cycle_time_sec}
                          onChange={(e) => handleCycleTimeChange(i, e.target.value)}
                          className="w-20 text-right text-xs font-mono font-semibold p-1 rounded border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <span className="text-xs text-muted-foreground font-mono">s</span>
                      </div>
                    </TableCell>

                    {/* Editable Hourly Rate */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-muted-foreground font-mono">₹</span>
                        <input
                          type="number"
                          step="50"
                          min="100"
                          value={op.hourly_rate_inr}
                          onChange={(e) => handleHourlyRateChange(i, e.target.value)}
                          className="w-20 text-right text-xs font-mono font-semibold p-1 rounded border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <span className="text-xs text-muted-foreground font-mono">/hr</span>
                      </div>
                    </TableCell>

                    {/* Calculated Cost Per Piece */}
                    <TableCell className="font-mono text-right font-bold text-sm text-foreground">
                      {formatCurrency(opCost, "INR")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DIRECT COSTS BREAKDOWN TABLE */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Direct Manufacturing Costs Summary</h3>
        <div className="rounded-md border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Cost Component</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost / Piece (INR)</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Share (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Raw Material Cost ({custom.grossWeightKg * 1000}g @ ₹{custom.rawMaterialRatePerKg}/kg)
                </TableCell>
                <TableCell className="font-mono text-right font-semibold">
                  {formatCurrency(netMaterialCostInr, "INR")}
                </TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">
                  {finalPrice > 0 ? `${((netMaterialCostInr / finalPrice) * 100).toFixed(1)}%` : "-"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  Direct Machining Cost ({activeOps.length} Operations, {(activeOps.reduce((a: number, b: InteractiveSetup) => a + b.cycle_time_sec, 0) / 60).toFixed(1)} mins)
                </TableCell>
                <TableCell className="font-mono text-right font-semibold">
                  {formatCurrency(totalMachiningCostInr, "INR")}
                </TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">
                  {finalPrice > 0 ? `${((totalMachiningCostInr / finalPrice) * 100).toFixed(1)}%` : "-"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Heat Treatment &amp; Outside Process</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(heatTreatmentCostInr, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">
                  {finalPrice > 0 ? `${((heatTreatmentCostInr / finalPrice) * 100).toFixed(1)}%` : "-"}
                </TableCell>
              </TableRow>

              <TableRow className="bg-muted/30 font-semibold border-t-2">
                <TableCell className="font-bold">Direct Base Subtotal</TableCell>
                <TableCell className="font-mono text-right text-primary font-bold">
                  {formatCurrency(directCostSubtotalInr, "INR")}
                </TableCell>
                <TableCell className="font-mono text-right font-bold">
                  {finalPrice > 0 ? `${((directCostSubtotalInr / finalPrice) * 100).toFixed(1)}%` : "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. OVERHEADS, MARGINS & FINAL PRICE */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Overheads, Tooling &amp; Markups</h3>
        <div className="rounded-md border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Item</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost / Piece (INR)</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Batch Total ({quantity} pcs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Factory Overhead &amp; Margin ({custom.marginPct + custom.factoryOverheadPct}%)</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheadAndMarginInr, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">{formatCurrency(overheadAndMarginInr * quantity, "INR")}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Tooling Amortization (Cutting inserts, collets, endmills)</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(toolingInr, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">{formatCurrency(toolingInr * quantity, "INR")}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Rejection &amp; Scrap Allowance</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(rejectionInr, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">{formatCurrency(rejectionInr * quantity, "INR")}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">QA / CMM Inspection &amp; First-Article Report</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(inspectionInr, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">{formatCurrency(inspectionInr * quantity, "INR")}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Corrosion Inhibiting Packaging &amp; FOB Dispatch</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(packagingInr, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-muted-foreground">{formatCurrency(packagingInr * quantity, "INR")}</TableCell>
              </TableRow>

              <TableRow className="bg-primary/5 font-bold border-t-2">
                <TableCell className="text-base text-primary">Final Ex-Works Price</TableCell>
                <TableCell className="font-mono text-right text-lg text-primary">{formatCurrency(finalPrice, "INR")}</TableCell>
                <TableCell className="font-mono text-right text-lg text-primary">{formatCurrency(batchTotal, "INR")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
