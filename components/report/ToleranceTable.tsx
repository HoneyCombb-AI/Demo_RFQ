import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DimensionalTolerance, formatTolerance, formatDimensionType } from "@/lib/data"

interface ToleranceTableProps {
  tolerances: DimensionalTolerance[]
}

export function ToleranceTable({ tolerances }: ToleranceTableProps) {
  if (!tolerances || tolerances.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
        Dimensional Tolerances
      </h4>
      <div className="rounded-md border bg-red-50/30">
        <Table>
          <TableHeader className="bg-red-50/50">
            <TableRow className="border-b-red-100 hover:bg-transparent">
              <TableHead className="w-[40%] text-xs font-medium tracking-wider uppercase">Characteristic</TableHead>
              <TableHead className="text-xs font-medium tracking-wider uppercase">Nominal</TableHead>
              <TableHead className="text-xs font-medium tracking-wider uppercase">Tolerance</TableHead>
              <TableHead className="text-xs font-medium tracking-wider uppercase">Class</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tolerances.map((tol, index) => (
              <TableRow key={index} className="border-b-red-100 hover:bg-red-50/80">
                <TableCell className="font-medium text-sm">
                  {formatDimensionType(tol.dimension_type)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {tol.nominal_value_mm}
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {formatTolerance(tol.plus_mm, tol.minus_mm)}
                </TableCell>
                <TableCell className="text-sm">
                  {tol.tolerance_class || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
