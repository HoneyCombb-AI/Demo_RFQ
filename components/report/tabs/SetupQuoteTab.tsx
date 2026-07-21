import * as React from "react"
import { SetupQuoteData, formatCurrency, formatMachineFamily } from "@/lib/data"
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

export function SetupQuoteTab({ quote }: { quote: SetupQuoteData }) {
  const summary = quote.summary
  const materialCost = quote.material_cost

  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">Final Price/Piece</div>
            <div className="text-2xl font-bold font-mono">{formatCurrency(summary.final_price_per_piece_inr, quote.currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Batch Total</div>
            <div className="text-2xl font-bold font-mono">{formatCurrency(summary.batch_total_inr, quote.currency)}</div>
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

      {/* Material Cost Detail */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Material Cost</h3>
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Stock Form</span>
                <span className="font-medium">{materialCost.stock_form.replace(/_/g, " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Weight</span>
                <span className="font-mono">{materialCost.weight_kg.toFixed(3)} kg</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Rate</span>
                <span className="font-mono">{formatCurrency(materialCost.price_per_kg_inr)}/kg</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Cost/Piece</span>
                <span className="font-mono font-bold">{formatCurrency(materialCost.material_cost_per_piece_inr)}</span>
              </div>
            </div>
            {Object.keys(materialCost.stock_dimensions).filter(k => k !== "notes").length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-2">Stock Dimensions</span>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(materialCost.stock_dimensions)
                    .filter(([k]) => k !== "notes")
                    .map(([key, val]) => (
                      <Badge key={key} variant="outline" className="font-mono text-xs">
                        {key.replace(/_/g, " ")}: {val}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Setup Costs Breakdown */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Setup Costs Breakdown</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold tracking-wider uppercase w-[5%]">#</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase w-[35%]">Setup</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Machine</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Rate/hr</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cycle Time</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Cost/Piece</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.setup_costs.map((setup, idx) => (
                <TableRow key={setup.setup_id}>
                  <TableCell className="font-mono text-muted-foreground text-sm">{idx + 1}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{setup.setup_name}</span>
                    {setup.outside_process && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">Outside</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground uppercase">{formatMachineFamily(setup.machine_family)}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    {setup.hourly_rate_inr > 0 ? `${formatCurrency(setup.hourly_rate_inr)}` : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    {setup.machining_time_per_piece_min > 0
                      ? `${setup.machining_time_per_piece_min.toFixed(2)} min`
                      : "-"}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-sm text-right">
                    {formatCurrency(setup.total_cost_per_piece_inr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Cost Summary Breakdown */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%] text-xs font-semibold tracking-wider uppercase">Cost Component</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase text-right">Per Piece</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Material</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.material_cost_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Raw material + stock</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Machining</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.machining_cost_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">All setups combined</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Setup Amortization</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.setup_cost_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Setup costs / {summary.quantity} pcs</TableCell>
              </TableRow>
              {summary.outside_process_cost_per_piece_inr > 0 && (
                <TableRow>
                  <TableCell className="font-medium">Outside Processes</TableCell>
                  <TableCell className="font-mono text-right">{formatCurrency(summary.outside_process_cost_per_piece_inr)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">Vendor operations</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Tooling</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.tool_cost_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Consumable tools</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rejection Allowance</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.rejection_cost_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Scrap allowance</TableCell>
              </TableRow>

              {/* Subtotal */}
              <TableRow className="border-t-2">
                <TableCell className="font-bold text-foreground">Subtotal</TableCell>
                <TableCell className="font-mono text-right font-bold text-foreground">{formatCurrency(summary.subtotal_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">Before overhead & margin</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Overhead</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.overhead_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{summary.overhead_percent}% of subtotal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Margin</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(summary.margin_per_piece_inr)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{summary.margin_percent}% profit</TableCell>
              </TableRow>

              {/* Final Total */}
              <TableRow className="bg-primary/5 border-t-2 border-primary/20 hover:bg-primary/10">
                <TableCell className="font-bold text-lg text-primary">Final Price/Piece</TableCell>
                <TableCell className="font-mono text-right font-bold text-lg text-primary">{formatCurrency(summary.final_price_per_piece_inr)}</TableCell>
                <TableCell className="text-primary/70 text-sm font-medium">Ex-works {quote.currency}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Warnings */}
      {quote.warnings.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Warnings</h3>
          <div className="space-y-2">
            {quote.warnings.map((w, i) => (
              <div key={i} className="p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-800">
                {w}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
