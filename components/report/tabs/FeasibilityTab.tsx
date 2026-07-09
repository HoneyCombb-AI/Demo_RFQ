"use client"

import * as React from "react"
import { ReportData, SpecAssessment } from "@/lib/data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, AlertTriangle, Info, ChevronDown, ChevronRight, Search } from "lucide-react"

function formatText(text: string) {
  if (!text) return ""
  return text
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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

function SpecRow({ sa }: { sa: SpecAssessment & { feature_id: string; feature_name: string } }) {
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
        <TableCell className="font-medium text-sm">
          {formatText(sa.spec_description)}
          {sa.feature_name && (
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              {sa.feature_name}
            </span>
          )}
        </TableCell>
        <TableCell className="font-mono text-sm">{sa.nominal_value}</TableCell>
        <TableCell><VerdictBadge verdict={sa.verdict} /></TableCell>
        <TableCell className="text-xs text-muted-foreground">{sa.required_process}</TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground text-right">{sa.feature_id}</TableCell>
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
  const [searchTerm, setSearchTerm] = React.useState("")
  const f = data.feasibility.feasibility

  // Flatten all spec assessments from all features
  const allSpecs = React.useMemo(() => {
    return data.feasibility.feature_assessments.flatMap((fa) => 
      fa.spec_assessments.map((sa) => ({
        ...sa,
        feature_id: fa.feature_id,
        feature_name: fa.feature_name,
      }))
    )
  }, [data.feasibility.feature_assessments])

  // Filter based on search term
  const filteredSpecs = React.useMemo(() => {
    const term = searchTerm.toLowerCase()
    if (!term) return allSpecs
    
    return allSpecs.filter((sa) => 
      sa.spec_description.toLowerCase().includes(term) ||
      sa.feature_name.toLowerCase().includes(term) ||
      sa.feature_id.toLowerCase().includes(term) ||
      sa.verdict.toLowerCase().includes(term) ||
      (sa.nominal_value && sa.nominal_value.toLowerCase().includes(term))
    )
  }, [allSpecs, searchTerm])

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
      {/* Overall Summary Card */}
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

      {/* Flattened Spec Assessments Table */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Spec Assessments</h3>
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter specs..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground font-mono whitespace-nowrap">
              {filteredSpecs.length} specs
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
          {filteredSpecs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 border-dashed">
              No spec assessments match your search.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/70 hover:bg-muted/70 border-b-2 border-border/50">
                  <TableHead className="w-9 px-2"></TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Specification</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Nominal</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Verdict</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Process</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80 text-right">Feature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpecs.map((sa, i) => (
                  <SpecRow key={`${sa.feature_id}-${i}`} sa={sa} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  )
}
