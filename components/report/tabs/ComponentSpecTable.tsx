import * as React from "react"
import { ComponentSpecData } from "@/lib/data"
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
import { Cog, FileText } from "lucide-react"

interface ComponentSpecTableProps {
  spec: ComponentSpecData
}

export function ComponentSpecTable({ spec }: ComponentSpecTableProps) {
  if (!spec || !spec.parameters || spec.parameters.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-md text-primary">
            <Cog className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Component Specification Table</h3>
            <p className="text-xs text-muted-foreground">{spec.spec_title}</p>
          </div>
        </div>
        {spec.component_type && (
          <Badge variant="outline" className="font-mono text-xs uppercase">
            {spec.component_type.replace(/_/g, " ")}
          </Badge>
        )}
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[45%] text-xs font-semibold tracking-wider uppercase">
                Parameter / Characteristic
              </TableHead>
              <TableHead className="w-[12%] text-xs font-semibold tracking-wider uppercase">
                Symbol
              </TableHead>
              <TableHead className="w-[20%] text-xs font-semibold tracking-wider uppercase">
                Value / Specification
              </TableHead>
              <TableHead className="w-[10%] text-xs font-semibold tracking-wider uppercase">
                Unit
              </TableHead>
              <TableHead className="w-[13%] text-xs font-semibold tracking-wider uppercase">
                Standard / Ref
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spec.parameters.map((param, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-medium text-sm">
                  <div className="text-foreground">{param.parameter_name}</div>
                  {param.row_notes && (
                    <div className="text-xs text-muted-foreground mt-0.5">{param.row_notes}</div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-primary">
                  {param.symbol ? (
                    <span className="bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                      {param.symbol}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  {param.value_raw}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {param.unit || "-"}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {param.standard_ref ? (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {param.standard_ref}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {spec.extraction_notes && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border border-dashed">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>{spec.extraction_notes}</span>
        </div>
      )}
    </div>
  )
}
