import * as React from "react"
import { ComponentSpecData } from "@/lib/data"
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
  spec: ComponentSpecData | ComponentSpecData[]
}

function SingleSpecTable({ spec }: { spec: ComponentSpecData }) {
  if (!spec || !spec.parameters || spec.parameters.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-md text-primary">
            <Cog className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {spec.spec_title || "Component Specification Table"}
            </h3>
            {spec.component_type && (
              <p className="text-xs text-muted-foreground font-mono uppercase">
                {spec.component_type.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>
        {spec.section_id && (
          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
            {spec.section_id}
          </Badge>
        )}
      </div>

      <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/70 hover:bg-muted/70 border-b-2 border-border/50">
              <TableHead className="w-[40%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">
                Parameter / Characteristic
              </TableHead>
              <TableHead className="w-[10%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">
                Symbol
              </TableHead>
              <TableHead className="w-[20%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">
                Value / Spec
              </TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">
                Tolerance
              </TableHead>
              <TableHead className="w-[8%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">
                Unit
              </TableHead>
              <TableHead className="w-[10%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">
                Standard / Ref
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spec.parameters.map((param, idx) => {
              const hasTol = param.plus_tolerance !== undefined || param.minus_tolerance !== undefined
              let tolStr = "-"
              if (hasTol) {
                if (param.plus_tolerance === param.minus_tolerance && param.plus_tolerance !== undefined) {
                  tolStr = `±${param.plus_tolerance}`
                } else {
                  const plus = param.plus_tolerance !== undefined ? `+${param.plus_tolerance}` : ""
                  const minus = param.minus_tolerance !== undefined ? `-${param.minus_tolerance}` : ""
                  tolStr = `${plus} ${minus}`.trim() || "-"
                }
              }

              return (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-sm">
                    <div className="text-foreground font-semibold">{param.parameter_name}</div>
                    {param.row_notes && (
                      <div className="text-xs text-muted-foreground mt-0.5">{param.row_notes}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {param.symbol ? (
                      <span className="bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                        {param.symbol}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold text-foreground">
                    {param.value_raw}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {hasTol ? (
                      <span className="bg-muted px-1.5 py-0.5 rounded border font-mono">
                        {tolStr}
                      </span>
                    ) : (
                      "-"
                    )}
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
              )
            })}
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

export function ComponentSpecTable({ spec }: ComponentSpecTableProps) {
  if (!spec) return null

  const specsList = Array.isArray(spec) ? spec : [spec]
  const validSpecs = specsList.filter(s => s && s.parameters && s.parameters.length > 0)

  if (validSpecs.length === 0) return null

  return (
    <div className="space-y-6">
      {validSpecs.map((s, idx) => (
        <SingleSpecTable key={s.section_id || idx} spec={s} />
      ))}
    </div>
  )
}
