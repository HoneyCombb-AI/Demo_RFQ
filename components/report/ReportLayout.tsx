"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Sparkles,
  Mail,
  FileSearch,
  Layers,
  CheckCircle2,
  Clock,
  Calculator,
  FileSpreadsheet,
  Rocket,
} from "lucide-react"
import { ReportData } from "@/lib/data"
import { DrawingSidebar } from "./DrawingSidebar"
import { ReportTabs } from "./ReportTabs"
import { JoyrideTour, type TourStepDef } from "./JoyrideTour"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// JTT — Org 4521 (Ravi Sir). Scoped to two specific RFQ slugs only.
// ---------------------------------------------------------------------------
const JTT_RFQ_SLUGS = new Set([
  "c_14_373-00_stirnrad_z39_links_levmix",
  "c-14-374-00-zahnwelle-z9-rechts-levmix",
])

const JTT_TOUR_STEPS: TourStepDef[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome Ravi Sir to Honeycomb AI!",
    subtitle: "Automated RFQ Analysis",
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    content:
      "Welcome Ravi Sir. Here is the complete end-to-end RFQ automation from customer drawing in to final quote out.",
  },
  {
    target: '[data-tour="header-info"]',
    placement: "bottom",
    title: "Email & Input Ingestion",
    subtitle: "Input Processing",
    icon: <Mail className="w-4 h-4 text-blue-500" />,
    content:
      "Your team forwards customer emails to our tracked inbox. Attached 2D drawings and email requirements are automatically pulled in.",
  },
  {
    target: '[data-tour="drawing-image"]',
    placement: "right",
    title: "Automated 2D Drawing Ballooning",
    subtitle: "2D Drawing & CAD Analysis",
    icon: <FileSearch className="w-4 h-4 text-purple-500" />,
    content:
      "The attached 2D drawing is automatically parsed, vectorized, and ballooned with full characteristic numbers and tolerances.",
  },
  {
    target: '[data-tour="tab-specs"]',
    targetTab: "specs",
    placement: "bottom",
    title: "Extracted Part Specifications",
    subtitle: "Switching to the Specs tab",
    icon: <Layers className="w-4 h-4 text-emerald-500" />,
    content:
      "All drawing parameters, dimensions, threads, and tolerances are extracted into structured specification tables.",
  },
  {
    target: '[data-tour="tab-feasibility"]',
    targetTab: "feasibility",
    placement: "bottom",
    title: "Feasibility Summary",
    subtitle: "Switching to the Feasibility tab",
    icon: <CheckCircle2 className="w-4 h-4 text-teal-500" />,
    content:
      "Exact spec-wise feasibility report generated in your team's exact requested format.",
  },
  {
    target: '[data-tour="tab-routing"]',
    targetTab: "routing",
    placement: "bottom",
    title: "Routing & Cycle Time Calculation",
    subtitle: "Switching to the Routing tab",
    icon: <Clock className="w-4 h-4 text-indigo-500" />,
    content:
      "Detailed step-wise machines, processors, etc. used creating the incoming RFQ component (routing) — along with cycle times. Cycle times are calculated strictly using your company's excel sheets and engineering logic.",
  },
  {
    target: '[data-tour="tab-quote"]',
    targetTab: "quote",
    placement: "bottom",
    title: "Commercial Quote & Margins",
    subtitle: "Switching to the Quote tab",
    icon: <Calculator className="w-4 h-4 text-green-600" />,
    content:
      "Final quote displayed and broken down in your segments. Final quote for this RFQ verified by your team.",
  },
  {
    target: "body",
    placement: "center",
    title: "Native Excel Output",
    subtitle: "Complete Integration",
    icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
    content:
      "Everything is also automatically exported into your company's native Excel sheet format that they have been currently using for their RFQ quoting process. Excel sheet output for this RFQ attached in the email sent. Honeycomb AI analyses your RFQ within 15 mins.",
  },
]

// ---------------------------------------------------------------------------
// SFT — Org 6061 (Prashant). Pitched as a trust-building demo → pilot.
// ---------------------------------------------------------------------------
const SFT_RFQ_SLUGS = new Set([
  "359110_plunger_leakdown",
])

const SFT_TOUR_STEPS: TourStepDef[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome Prashant to Honeycomb AI!",
    subtitle: "RFQ Automation Demo",
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    content:
      "Hi Prashant! We're building an RFQ automation system where your team simply forwards emails — the goal is to cut your RFQ processing time significantly and deliver consistent, accurate quotes. I wanted to quickly show you how it works on your own RFQ.",
  },
  {
    target: '[data-tour="header-info"]',
    placement: "bottom",
    title: "Your RFQ, Straight from Your Team",
    subtitle: "Input Ingestion",
    icon: <Mail className="w-4 h-4 text-blue-500" />,
    content:
      "This RFQ was shared by Balakrishna from your team. Your team simply forwards the customer email with the attached drawing — our system picks it up automatically. No manual data entry, no copy-paste.",
  },
  {
    target: '[data-tour="drawing-image"]',
    placement: "right",
    title: "Automated 2D Drawing Analysis",
    subtitle: "Drawing Parsing & Ballooning",
    icon: <FileSearch className="w-4 h-4 text-purple-500" />,
    content:
      "The attached drawing is automatically parsed and ballooned — every dimension, tolerance, and characteristic gets numbered and extracted. No one on your team needs to manually read or interpret the drawing.",
  },
  {
    target: '[data-tour="tab-specs"]',
    targetTab: "specs",
    placement: "bottom",
    title: "All Specs Extracted Automatically",
    subtitle: "Switching to Specs tab",
    icon: <Layers className="w-4 h-4 text-emerald-500" />,
    content:
      "Every spec from the drawing — dimensions, threads, tolerances, surface finishes — pulled into a clean structured table. Ready for feasibility review with zero manual effort.",
  },
  {
    target: '[data-tour="tab-feasibility"]',
    targetTab: "feasibility",
    placement: "bottom",
    title: "Feasibility in Your Format",
    subtitle: "Switching to Feasibility tab",
    icon: <CheckCircle2 className="w-4 h-4 text-teal-500" />,
    content:
      "A full spec-wise feasibility report, generated automatically. This can be configured to match any format your team currently uses — dimensions, tolerances, process flags, whatever your team needs to see.",
  },
  {
    target: '[data-tour="tab-routing"]',
    targetTab: "routing",
    placement: "bottom",
    title: "Complete Routing & Cycle Times",
    subtitle: "Switching to Routing tab",
    icon: <Clock className="w-4 h-4 text-indigo-500" />,
    content:
      "Full process routing — every operation, sub-operation, machine, and cycle time — calculated automatically. The logic follows your team's own costing sheets and engineering rules.",
  },
  {
    target: '[data-tour="tab-quote"]',
    targetTab: "quote",
    placement: "bottom",
    title: "Structured Quote, Your Way",
    subtitle: "Switching to Quote tab",
    icon: <Calculator className="w-4 h-4 text-green-600" />,
    content:
      "The final quote is structured and broken down by cost segments. As we collect your data in the pilot, pricing accuracy improves and aligns to your existing costing sheets and desired quote ranges.",
  },
  {
    target: "body",
    placement: "center",
    title: "What Takes Days Now Takes 30 Minutes",
    subtitle: "Results & Next Steps",
    icon: <Rocket className="w-4 h-4 text-amber-500" />,
    content:
      "This was your own RFQ running on our system, configured with a demo shop profile — the purpose was to show that we can handle the RFQs you typically receive. In the pilot, we collect your shop profile, historical data, and Excel sheets to make the costing more accurate. We focus on one or two part families, define your metrics, and demonstrate the accuracy together. Once live, your engineer stays fully in control — approving every output, nothing goes off rails. We simply remove all the repeated manual tasks from his plate. Companies like Talbros, JAL Precision, Almity, and others are already on the platform. For JAL Precision specifically, we've reduced RFQ turnaround from 4–5 days to 15 minutes. I'd love to hear your thoughts.",
  },
]

// ---------------------------------------------------------------------------
// Tour config map — one entry per org that has a tour.
// ---------------------------------------------------------------------------
interface TourConfig {
  rfqSlugs: Set<string>
  steps: TourStepDef[]
  buttonLabel: string
}

const TOUR_CONFIGS: Record<string, TourConfig> = {
  jtt: {
    rfqSlugs: JTT_RFQ_SLUGS,
    steps: JTT_TOUR_STEPS,
    buttonLabel: "Executive Tour (Ravi Sir)",
  },
  sft: {
    rfqSlugs: SFT_RFQ_SLUGS,
    steps: SFT_TOUR_STEPS,
    buttonLabel: "Product Demo (Prashant)",
  },
}

function getTourConfig(data: ReportData): TourConfig | null {
  const cfg = TOUR_CONFIGS[data.orgSlug]
  if (!cfg) return null
  if (!cfg.rfqSlugs.has(data.slug)) return null
  return cfg
}

export function ReportLayout({ data }: { data: ReportData }) {
  const part = data.featureGraph.part
  const featureCount = data.featureGraph.feature_graph.features.length
  const setupCount = data.computedRoute.total_summary.total_setups
  const subOpCount = data.computedRoute.total_summary.total_sub_operations
  const tourConfig = getTourConfig(data)
  const tourEnabled = tourConfig !== null

  const [activeTab, setActiveTab] = React.useState("specs")
  const [isTourOpen, setIsTourOpen] = React.useState(tourEnabled)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Executive Guided Tour overlay */}
      {tourEnabled && tourConfig && (
        <JoyrideTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onTabChange={setActiveTab}
          stepDefs={tourConfig.steps}
        />
      )}

      {/* Header */}
      <header className="border-b bg-background shrink-0" data-tour="header-info">
        <div className="px-6 py-4 flex items-start justify-between">
          <div>
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

          {tourEnabled && tourConfig && (
            <Button
              onClick={() => setIsTourOpen(true)}
              className="py-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md gap-2 border border-amber-400/30"
            >
              <Sparkles className="w-4 h-4" />
              {tourConfig.buttonLabel}
            </Button>
          )}
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
          balloonedImageUrls={data.balloonedImageUrls}
          originalImageUrls={data.originalImageUrls}
        />
        <ReportTabs 
          data={data} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </main>
    </div>
  )
}
