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

export function JttQuoteTab({ quote }: { quote: JttQuoteData }) {
  const { weights, direct_cost, overheads_and_surcharges, pricing_summary, machining_operations, quantity } = quote
  const batchTotal = pricing_summary.final_ex_works_price_inr * quantity

  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">
              Final Ex-Works Price/Piece
            </div>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(pricing_summary.final_ex_works_price_inr, "INR")}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Batch Total
            </div>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(batchTotal, "INR")}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Quantity
            </div>
            <div className="text-2xl font-bold font-mono">{quantity} pcs</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Currency
            </div>
            <div className="text-2xl font-bold font-mono">INR</div>
          </CardContent>
        </Card>
      </div>

      {/* Material & Stock Weights */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Material & Stock Weight Breakdown</h3>
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                  Gross Weight
                </span>
                <span className="font-mono font-medium">
                  {weights.gross_weight_kg ? `${weights.gross_weight_kg.toFixed(4)} kg` : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                  Net Weight
                </span>
                <span className="font-mono font-medium">
                  {weights.net_weight_kg ? `${weights.net_weight_kg.toFixed(4)} kg` : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                  Scrap Weight
                </span>
                <span className="font-mono font-medium text-amber-600">
                  {weights.scrap_weight_kg ? `${weights.scrap_weight_kg.toFixed(4)} kg` : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                  Material Cost / Piece
                </span>
                <span className="font-mono font-bold">
                  {formatCurrency(direct_cost.material_cost_inr, "INR")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t flex flex-wrap gap-3 items-center">
              <span className="text-muted-foreground text-xs uppercase tracking-wider mr-2">
                Stock Parameters:
              </span>
              {weights.raw_bar_dia_mm && (
                <Badge variant="outline" className="font-mono text-xs">
                  Raw Bar Ø: {weights.raw_bar_dia_mm} mm
                </Badge>
              )}
              {weights.actual_bar_dia_mm && (
                <Badge variant="outline" className="font-mono text-xs">
                  Actual Bar Ø: {weights.actual_bar_dia_mm} mm
                </Badge>
              )}
              {weights.pcs_per_5m_bar && (
                <Badge variant="outline" className="font-mono text-xs">
                  Bar Yield: {weights.pcs_per_5m_bar} pcs / 5m bar
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Operations Cost Breakdown */}
      {machining_operations && machining_operations.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Machining Operations Breakdown</h3>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase w-[5%]">#</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase w-[40%]">Operation</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">Machine</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cycle Time</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Hourly Rate</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost/Piece</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machining_operations.map((op, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-muted-foreground text-sm">{op.sequence}</TableCell>
                    <TableCell className="text-sm font-medium">{op.operation_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground uppercase">
                      {formatMachineFamily(op.machine_family)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-right text-muted-foreground">
                      {op.cycle_time_sec > 0 ? `${op.cycle_time_sec.toFixed(1)} s` : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-right text-muted-foreground">
                      {op.hourly_rate_inr > 0 ? `${formatCurrency(op.hourly_rate_inr, "INR")}/hr` : "-"}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-sm text-right">
                      {formatCurrency(op.cost_per_piece_inr, "INR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Cost Component Breakdown */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Cost Component Summary</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Cost Component</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Per Piece (INR)</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Direct Costs */}
              <TableRow>
                <TableCell className="font-medium">Raw Material Cost</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(direct_cost.material_cost_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Raw material consumption</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Direct Machining Cost</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(direct_cost.machining_cost_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">CNC Turning, Hobbing & Grinding</TableCell>
              </TableRow>
              {direct_cost.heat_treatment_cost_inr !== undefined && direct_cost.heat_treatment_cost_inr > 0 && (
                <TableRow>
                  <TableCell className="font-medium">Heat Treatment Cost</TableCell>
                  <TableCell className="font-mono text-right">{formatCurrency(direct_cost.heat_treatment_cost_inr, "INR")}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">Case hardening & tempering</TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/10 font-semibold">
                <TableCell className="font-medium">Direct Cost Subtotal</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(direct_cost.direct_cost_subtotal_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Material + Machining + Heat Treat</TableCell>
              </TableRow>

              {/* Surcharges & Overheads */}
              <TableRow>
                <TableCell className="font-medium">Tooling Cost</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheads_and_surcharges.tooling_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Inserts, hobs & grinding wheels</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rejection Allowance</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheads_and_surcharges.rejection_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Quality risk & scrap buffer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Inspection & Metrology</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheads_and_surcharges.inspection_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">CMM & gear measurement check</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cleaning & Degreasing</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheads_and_surcharges.cleaning_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Part washing & rust preventive</TableCell>
              </TableRow>
              {overheads_and_surcharges.scrap_recovery_credit_inr !== undefined && overheads_and_surcharges.scrap_recovery_credit_inr !== 0 && (
                <TableRow>
                  <TableCell className="font-medium text-emerald-600">Scrap Recovery Credit</TableCell>
                  <TableCell className="font-mono text-right text-emerald-600">
                    {formatCurrency(overheads_and_surcharges.scrap_recovery_credit_inr, "INR")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">Steel scrap credit offset</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Packaging & FOB Freight</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheads_and_surcharges.packaging_and_fob_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Export seaworthy packing & dispatch</TableCell>
              </TableRow>

              {/* Subtotal before margin */}
              <TableRow className="border-t-2 bg-muted/10 font-semibold">
                <TableCell className="font-medium">Subtotal Before Margin</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(pricing_summary.subtotal_before_margin_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Direct costs + all surcharges</TableCell>
              </TableRow>

              {/* Factory Overhead & Margin */}
              <TableRow>
                <TableCell className="font-medium">Overhead & Operating Margin</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(pricing_summary.overhead_and_margin_inr, "INR")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Plant overheads & operating margin</TableCell>
              </TableRow>

              {/* Final Ex-Works Price */}
              <TableRow className="bg-primary/5 border-t-2 border-primary/20 hover:bg-primary/10">
                <TableCell className="font-bold text-lg text-primary">Final Ex-Works Price / Piece</TableCell>
                <TableCell className="font-mono text-right font-bold text-lg text-primary">
                  {formatCurrency(pricing_summary.final_ex_works_price_inr, "INR")}
                </TableCell>
                <TableCell className="text-primary/70 text-sm font-medium">Ex-Works factory gate price (INR)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
