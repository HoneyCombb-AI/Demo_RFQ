import * as React from "react"
import { JttQuoteData, formatCurrency, formatMachineFamily } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function QuoteTab({ quote }: { quote: JttQuoteData | any }) {
  if (!quote) return null

  const { weights, direct_cost, machining_operations, quantity } = quote

  const finalPrice =
    quote.pricing_summary?.final_ex_works_price_inr ??
    quote.pricing_and_duties?.final_landed_price_inr ??
    null

  const batchTotal = finalPrice != null && quantity != null ? finalPrice * quantity : null
  const overheads = quote.overheads_and_surcharges ?? quote.cif_and_overheads ?? null

  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">
              Final Price/Piece
            </div>
            <div className="text-2xl font-bold font-mono">
              {finalPrice != null ? formatCurrency(finalPrice, "INR") : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Batch Total
            </div>
            <div className="text-2xl font-bold font-mono">
              {batchTotal != null ? formatCurrency(batchTotal, "INR") : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Quantity
            </div>
            <div className="text-2xl font-bold font-mono">{quantity != null ? `${quantity} pcs` : "—"}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Currency
            </div>
            <div className="text-2xl font-bold font-mono">{quote.currency ?? "INR"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Material & Stock Weights */}
      {weights && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Material &amp; Stock Specification</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {weights.raw_bar_dia_mm != null && (
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Raw Bar Ø</div>
                <div className="text-lg font-bold font-mono mt-1">{weights.raw_bar_dia_mm} mm</div>
              </div>
            )}
            {weights.actual_bar_dia_mm != null && (
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Actual Bar Ø</div>
                <div className="text-lg font-bold font-mono mt-1">{weights.actual_bar_dia_mm} mm</div>
              </div>
            )}
            {weights.gross_weight_kg != null && (
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Gross Weight</div>
                <div className="text-lg font-bold font-mono mt-1">{weights.gross_weight_kg} kg</div>
              </div>
            )}
            {weights.net_weight_kg != null && (
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Net Weight</div>
                <div className="text-lg font-bold font-mono mt-1">{weights.net_weight_kg} kg</div>
              </div>
            )}
            {weights.scrap_weight_kg != null && (
              <div className="bg-card border rounded-lg p-3 text-center">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Scrap Weight</div>
                <div className="text-lg font-bold font-mono mt-1">{weights.scrap_weight_kg} kg</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Direct Costs Breakdown */}
      {direct_cost && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Direct Manufacturing Costs</h3>
          <div className="rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Cost Component</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost / Piece (INR)</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Share (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {direct_cost.material_cost_inr != null && (
                  <TableRow>
                    <TableCell className="font-medium">Raw Material Cost</TableCell>
                    <TableCell className="font-mono text-right">{formatCurrency(direct_cost.material_cost_inr, "INR")}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">
                      {finalPrice > 0 ? `${((direct_cost.material_cost_inr / finalPrice) * 100).toFixed(1)}%` : "-"}
                    </TableCell>
                  </TableRow>
                )}
                {direct_cost.machining_cost_inr != null && (
                  <TableRow>
                    <TableCell className="font-medium">Direct Machining Cost</TableCell>
                    <TableCell className="font-mono text-right">{formatCurrency(direct_cost.machining_cost_inr, "INR")}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">
                      {finalPrice > 0 ? `${((direct_cost.machining_cost_inr / finalPrice) * 100).toFixed(1)}%` : "-"}
                    </TableCell>
                  </TableRow>
                )}
                {direct_cost.heat_treatment_cost_inr != null && (
                  <TableRow>
                    <TableCell className="font-medium">Heat Treatment &amp; Outside Process</TableCell>
                    <TableCell className="font-mono text-right">{formatCurrency(direct_cost.heat_treatment_cost_inr, "INR")}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">
                      {finalPrice > 0 ? `${((direct_cost.heat_treatment_cost_inr / finalPrice) * 100).toFixed(1)}%` : "-"}
                    </TableCell>
                  </TableRow>
                )}
                {(direct_cost.direct_cost_subtotal_inr != null || direct_cost.direct_base_inr != null) && (() => {
                  const subtotal = direct_cost.direct_cost_subtotal_inr ?? direct_cost.direct_base_inr
                  return (
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell>Direct Base Subtotal</TableCell>
                      <TableCell className="font-mono text-right text-primary">
                        {formatCurrency(subtotal, "INR")}
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        {finalPrice != null && finalPrice > 0 ? `${((subtotal / finalPrice) * 100).toFixed(1)}%` : "-"}
                      </TableCell>
                    </TableRow>
                  )
                })()}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Overheads, Duties & Surcharges */}
      {overheads && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Overheads, Duties &amp; Surcharges</h3>
          <div className="rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Item</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost / Piece (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(overheads).map(([k, v]) => {
                  if (typeof v !== "number" || v === 0) return null
                  const label = k.replace(/_inr$/i, "").replace(/_pct_/i, "% ").replace(/_/g, " ").toUpperCase()
                  return (
                    <TableRow key={k}>
                      <TableCell className="font-medium capitalize">{label}</TableCell>
                      <TableCell className="font-mono text-right">
                        {v < 0 ? `-${formatCurrency(Math.abs(v), "INR")}` : formatCurrency(v, "INR")}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Machining Operations Breakdown */}
      {machining_operations && machining_operations.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Machining Operations &amp; Cycle Time Cost</h3>
          <div className="rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px] text-xs font-semibold tracking-wider uppercase text-center">Op #</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">Operation Name</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">Machine Family</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cycle Time (s)</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Rate / Hr</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost / pc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machining_operations.map((op: any, i: number) => (
                  <TableRow key={`op-${op.sequence || i}-${i}`}>
                    <TableCell className="font-mono text-xs text-center font-bold">{op.sequence}</TableCell>
                    <TableCell className="font-semibold text-sm">{op.operation_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatMachineFamily(op.machine_family)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-right text-xs">
                      {op.cycle_time_sec?.toFixed(1)} s
                    </TableCell>
                    <TableCell className="font-mono text-right text-xs">
                      {formatCurrency(op.hourly_rate_inr, "INR")}/hr
                    </TableCell>
                    <TableCell className="font-mono text-right font-semibold text-sm">
                      {formatCurrency(op.cost_per_piece_inr, "INR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  )
}
