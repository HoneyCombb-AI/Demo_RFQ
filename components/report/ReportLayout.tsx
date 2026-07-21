import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ReportData } from "@/lib/data"
import { DrawingSidebar } from "./DrawingSidebar"
import { ReportTabs } from "./ReportTabs"

export function ReportLayout({ data }: { data: ReportData }) {
  const part = data.featureGraph.part
  const featureCount = data.featureGraph.feature_graph.features.length
  const setupCount = data.computedRoute.total_summary.total_setups
  const subOpCount = data.computedRoute.total_summary.total_sub_operations

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="border-b bg-background shrink-0">
        <div className="px-6 py-4">
          <Link
            href={`/${data.orgSlug}`}
            className="inline-flex items-center text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            All Reports
          </Link>
          
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            <span className="font-mono mr-2">{part.drawing_number}</span>
            <span className="text-muted-foreground font-normal mx-2">—</span>
            {part.name}
          </h1>
          
          <p className="text-sm text-muted-foreground font-medium">
            {part.material ?? "Material not specified"}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-2.5 bg-muted/10 border-t flex items-center gap-8">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-foreground font-mono">{featureCount}</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Features</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-foreground font-mono">{setupCount}</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Setups</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-foreground font-mono">{subOpCount}</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Sub-Ops</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-row overflow-hidden min-h-0">
        <DrawingSidebar 
          balloonedImageUrl={data.balloonedImageUrl} 
          originalImageUrl={data.originalImageUrl} 
        />
        <ReportTabs data={data} />
      </main>
    </div>
  )
}
