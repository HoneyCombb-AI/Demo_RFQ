"use client"

import * as React from "react"
import { ReportData, SpecAssessment } from "@/lib/data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RiskCard } from "../RiskCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, AlertTriangle, Info, ChevronDown, ChevronRight } from "lucide-react"

function VerdictBadge({ verdict }: { verdict: string }) {
  const v = verdict.toLowerCase()
  let color = "bg-green-100 text-green-700 border-green-200"
  let icon = <CheckCircle2 className="w-3 h-3" />
  if (v.includes("risk")) {
    color = "bg-amber-100 text-amber-700 border-amber-200"
    icon = <AlertTriangle className="w-3 h-3" />
  }
  if (v.includes("fail") || v.includes("not")) {
    color = "bg-red-100 text-red-700 border-red-200"
    icon = <XCircle className="w-3 h-3" />
  }
  if (v.includes("info") || v.includes("missing")) {
    color = "bg-blue-100 text-blue-700 border-blue-200"
    icon = <Info className="w-3 h-3" />
  }

  return (
    <Badge variant="outline" className={`${color} text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0 shadow-none whitespace-nowrap gap-1`}>
      {icon}
      {verdict.replace(/_/g, " ")}
    </Badge>
  )
}

function SpecRow({ sa }: { sa: SpecAssessment }) {
  const [expanded, setExpanded] = React.useState(false)
  const hasRisk = sa.risk_description || sa.verdict.toLowerCase().includes("risk") || sa.verdict.toLowerCase().includes("missing")

  return (
    <>
      <TableRow
        className={`cursor-pointer transition-colors ${
          hasRisk
            ? "bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
            : "hover:bg-muted/30"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="w-9 px-2">
          {expanded
            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          }
        </TableCell>
        <TableCell className="font-medium text-sm">{sa.spec_description}</TableCell>
        <TableCell className="font-mono text-sm">{sa.nominal_value}</TableCell>
        <TableCell className="font-mono text-sm whitespace-nowrap">{sa.tolerance_or_requirement || "–"}</TableCell>
        <TableCell><VerdictBadge verdict={sa.verdict} /></TableCell>
        <TableCell className="text-xs text-muted-foreground">{sa.required_process}</TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="px-6 py-3">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-foreground">Reasoning: </span>
                <span className="text-muted-foreground">{sa.reasoning}</span>
              </div>
              {sa.risk_description && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 dark:bg-amber-950/20 dark:border-amber-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-amber-700 text-xs uppercase tracking-wider">Risk</span>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-200">{sa.risk_description}</p>
                  {sa.mitigation && (
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      <span className="font-semibold">Mitigation:</span> {sa.mitigation}
                    </p>
                  )}
                </div>
              )}
              {!sa.risk_description && sa.mitigation && (
                <div>
                  <span className="font-semibold text-foreground">Mitigation: </span>
                  <span className="text-muted-foreground">{sa.mitigation}</span>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function FeasibilityTab({ data }: { data: ReportData }) {
  const f = data.feasibility.feasibility

  // Status badge styling
  let statusColor = "bg-green-100 text-green-700"
  if (f.status.toLowerCase().includes("risk")) statusColor = "bg-amber-100 text-amber-700"
  if (f.status.toLowerCase().includes("not")) statusColor = "bg-red-100 text-red-700"

  // Check items helper
  const CheckItem = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={passed ? "text-foreground" : "text-muted-foreground line-through"}>
        {label}
      </span>
    </div>
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Overall Summary Card — no colored top border */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Badge className={`${statusColor} hover:${statusColor} uppercase text-sm px-3 py-1`}>
              {f.status.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline" className="uppercase text-xs tracking-wider">
              RISK: {f.risk_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Capabilities Checklist</h4>
              <CheckItem label="Material Machinable" passed={f.material_machinable} />
              <CheckItem label="Tolerances Achievable" passed={f.tolerances_achievable} />
              <CheckItem label="Machines Available" passed={f.machines_available} />
              <CheckItem label="Part Fits Envelopes" passed={f.part_fits_envelopes} />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Assessment Notes</h4>
              <p className="text-sm leading-relaxed text-foreground">
                {f.assessment_notes}
              </p>
              {f.outside_processes_needed && f.outside_processes_needed.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-xs font-semibold uppercase text-muted-foreground mr-2">Outside Processes:</span>
                  <span className="text-sm">{f.outside_processes_needed.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Assessments as Tables */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Feature Assessments</h3>
        <div className="space-y-6">
          {data.feasibility.feature_assessments.map((fa) => (
            <Card key={fa.feature_id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 py-3 px-5 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50/50 font-mono font-bold text-sm px-2 py-0.5 rounded-sm shadow-none">
                      {fa.feature_id}
                    </Badge>
                    <span className="text-base font-semibold">{fa.feature_name}</span>
                  </div>
                </div>
                {fa.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{fa.notes}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                      <TableHead className="w-9 px-2"></TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Specification</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Nominal</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Tolerance / Requirement</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Verdict</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Process</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fa.spec_assessments.map((sa, i) => (
                      <SpecRow key={i} sa={sa} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
