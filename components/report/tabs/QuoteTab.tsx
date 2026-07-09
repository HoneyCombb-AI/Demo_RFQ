import * as React from "react"
import { ReportData, formatCurrency } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function QuoteTab({ data }: { data: ReportData }) {
  const quote = data.excelQuote
  const summary = quote.cost_summary

  const pricePerPiece = summary.ex_works_price_per_piece_inr
  const batchTotal = pricePerPiece * quote.quantity
  
  // Calculate approximate overhead from the provided data
  const subtotal = summary.total_cost_inr
  const overheadAndMargin = summary.profit_and_overhead_inr - summary.total_cost_inr

  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">Final Price/Piece</div>
            <div className="text-2xl font-bold font-mono">{formatCurrency(pricePerPiece, quote.currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Batch Total</div>
            <div className="text-2xl font-bold font-mono">{formatCurrency(batchTotal, quote.currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Quantity</div>
            <div className="text-2xl font-bold font-mono">{quote.quantity}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Currency</div>
            <div className="text-2xl font-bold font-mono">{quote.currency}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Component Breakdown */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Cost Component Breakdown</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40%] text-xs font-semibold tracking-wider uppercase">Cost Component</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Per Piece</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Material</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.bar_route_blank_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Raw material + stock</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Machining</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.total_machining_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">All setups combined</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Heat Treatment</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.heat_treatment_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">In-house heat treatment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Tooling</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.tool_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Consumable tools</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rejection</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.rejection_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Scrap allowance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Inspection</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.inspection_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Quality inspection</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cleaning</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.cleaning_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Part cleaning</TableCell>
              </TableRow>
              {summary.scrap_recovery_inr < 0 && (
                <TableRow>
                  <TableCell className="font-medium text-green-600">Scrap Recovery</TableCell>
                  <TableCell className="font-mono text-right text-green-600">{formatCurrency(summary.scrap_recovery_inr)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">Material recovery</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Packaging & FOB</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.packaging_cost_inr + summary.fob_cost_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Packaging and freight</TableCell>
              </TableRow>
              
              {/* Separator */}
              <TableRow className="border-t-2">
                <TableCell className="font-bold text-foreground">Subtotal</TableCell>
                <TableCell className="font-mono text-right font-bold text-foreground">{formatCurrency(subtotal)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Before overhead/margin</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Overhead & Margin</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(overheadAndMargin)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Factory overhead + profit margin</TableCell>
              </TableRow>
              
              {/* Final Total */}
              <TableRow className="bg-primary/5 border-t-2 border-primary/20 hover:bg-primary/10">
                <TableCell className="font-bold text-lg text-primary">Final Price/Piece</TableCell>
                <TableCell className="font-mono text-right font-bold text-lg text-primary">{formatCurrency(pricePerPiece)}</TableCell>
                <TableCell className="text-primary/70 text-sm font-medium">Ex-works {quote.currency}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Operations Cost Breakdown */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Operations Cost Breakdown</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Operation</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cycle Time</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Hourly Rate</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost/Piece</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.operations_cost_breakdown.map((op, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-sm">{op.operation}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    {op.cycle_time_sec > 0 ? `${op.cycle_time_sec.toFixed(1)} sec` : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    {op.hourly_rate_inr > 0 ? `${formatCurrency(op.hourly_rate_inr)}/hr` : "-"}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-right text-foreground">
                    {formatCurrency(op.cost_inr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
