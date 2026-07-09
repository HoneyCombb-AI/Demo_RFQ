"use client"

import * as React from "react"
import { ReportData, SpecItem } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FeatureCard } from "../FeatureCard"
import { Search, List, LayoutGrid, AlertCircle } from "lucide-react"

function ExtractedSpecsView({ specs, searchTerm }: { specs: SpecItem[]; searchTerm: string }) {
  const filtered = specs.filter((s) => {
    const term = searchTerm.toLowerCase()
    return (
      s.spec_id.toLowerCase().includes(term) ||
      s.feature_name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term) ||
      s.nominal_value.toLowerCase().includes(term) ||
      (s.tolerance_or_class?.toLowerCase().includes(term) ?? false)
    )
  })

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        No specs match your search.
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/70 hover:bg-muted/70 border-b-2 border-border/50">
            <TableHead className="w-16.25 text-[11px] font-bold tracking-wider uppercase text-foreground/80">#</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Characteristic</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Nominal</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Tolerance</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wider uppercase text-foreground/80">Class</TableHead>
            <TableHead className="w-16.25 text-[11px] font-bold tracking-wider uppercase text-foreground/80">Feature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((spec) => {
            // Split tolerance_or_class into tolerance vs class
            const raw = spec.tolerance_or_class || ""
            const isTolerance = /[+\-\/]/.test(raw) && /\d/.test(raw) && !raw.includes("DIN") && !raw.includes("ISO")
            const tolerance = isTolerance ? raw : "\u2013"
            const tolClass = !isTolerance && raw ? raw : (isTolerance ? "–" : "–")

            // Fix unit: if description is about an angle, replace mm with °
            const descLower = spec.description.toLowerCase()
            const isAngle = descLower.includes("angle") || descLower.includes("deg") || descLower.includes("helix") || descLower.includes("pressure") || descLower.includes("taper")
            let nominalDisplay = spec.nominal_value
            if (isAngle && nominalDisplay.includes("mm")) {
              nominalDisplay = nominalDisplay.replace(/\s*mm\s*$/, "°")
            }

            // Enrich vague descriptions with feature name context
            const vagueTerms = ["detail", "length", "diameter", "width", "depth", "angle", "chamfer", "radius", "size"]
            const words = spec.description.toLowerCase().split(/\s+/)
            const isVague = words.length <= 3 && words.some(w => vagueTerms.includes(w))
            const characteristic = isVague && spec.feature_name
              ? `${spec.description} (${spec.feature_name})`
              : spec.description

            return (
              <TableRow
                key={spec.spec_id}
                className="hover:bg-muted/30"
              >
                <TableCell className="font-mono font-bold text-sm text-red-600">
                  {spec.spec_id}
                </TableCell>
                <TableCell className="font-medium text-sm">{characteristic}</TableCell>
                <TableCell className="font-mono text-sm font-semibold">{nominalDisplay}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {tolerance}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {tolClass}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {spec.feature_id}
                </TableCell>

              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function SpecsTab({ data }: { data: ReportData }) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeSubTab, setActiveSubTab] = React.useState<"specs" | "features">("specs")

  const features = data.featureGraph.feature_graph.features

  const filteredFeatures = features.filter((f) => {
    const term = searchTerm.toLowerCase()
    return (
      f.name.toLowerCase().includes(term) ||
      f.description.toLowerCase().includes(term) ||
      f.feature_id.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Part-Level Specifications */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Part-Level Specifications</h2>
        <div className="bg-card rounded-lg border shadow-sm p-0 overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-border">
            {data.partLevelSpecs.map((spec, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start p-4 hover:bg-muted/50 transition-colors">
                <div className="w-full sm:w-40 shrink-0 text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1 sm:mb-0 pt-0.5">
                  {spec.label}
                </div>
                <div className="flex-1 text-sm text-foreground">
                  <span className="font-medium">{spec.value}</span>
                  {spec.detail && (
                    <span className="text-muted-foreground ml-2">{spec.detail}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Sub-tab selector + search */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Internal tabs */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
            <button
              onClick={() => { setActiveSubTab("specs"); setSearchTerm(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeSubTab === "specs"
                  ? "bg-background text-foreground shadow-sm border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Extracted Specs
              <Badge variant="secondary" className="ml-1 font-mono text-[10px]">{data.specList.length}</Badge>
            </button>
            <button
              onClick={() => { setActiveSubTab("features"); setSearchTerm(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeSubTab === "features"
                  ? "bg-background text-foreground shadow-sm border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Features
              <Badge variant="secondary" className="ml-1 font-mono text-[10px]">{features.length}</Badge>
            </button>
          </div>

          {/* Search + count */}
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={activeSubTab === "specs" ? "Filter specs..." : "Filter features..."}
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground font-mono whitespace-nowrap">
              {activeSubTab === "specs"
                ? `${data.specList.length} specs`
                : `${filteredFeatures.length} features`}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeSubTab === "specs" ? (
          <ExtractedSpecsView specs={data.specList} searchTerm={searchTerm} />
        ) : (
          <div className="space-y-6">
            {filteredFeatures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                No features match your search.
              </div>
            ) : (
              filteredFeatures.map((feature) => (
                <FeatureCard
                  key={feature.feature_id}
                  feature={feature}
                  specs={data.specList.filter(s => s.feature_id === feature.feature_id)}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  )
}
