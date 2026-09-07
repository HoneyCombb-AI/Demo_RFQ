import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Layers,
  ArrowRight,
  Sparkles,
  Cog,
  CheckCircle2,
  Wrench,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Top Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">RFQ Reports Portal</h1>
            <p className="text-xs text-muted-foreground">Automated Manufacturing Analysis & Quoting</p>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-primary/20 bg-primary/5 text-primary">
            <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
            AI-Assisted Costing
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="max-w-4xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
              Select Workspace Profile
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Choose Your Organization
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Select an organization to view detailed 2D drawing deconstructions, manufacturing routings, cycle time calculations, and final commercial quotes.
            </p>
          </div>

          {/* Organization Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {/* Organisation J Profile */}
            <Link href="/jal" className="block group">
              <Card className="h-full border-border/60 hover:border-primary/60 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-card flex flex-col justify-between overflow-hidden relative cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 to-orange-500 opacity-80" />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                      <Cog className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                    </div>
                    <Badge variant="secondary" className="font-semibold text-[11px] px-2.5 py-0.5">
                      Gear & Shaft Profile
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Organisation J
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium">
                    Org J Manufacturing Facility
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-sm flex-1 flex flex-col justify-between">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Automated drawing parsing, gear hobbing, vacuum carburizing heat treatment, and precision grinding operations.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Automated 2D Drawing Ballooning & Tolerances</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Dedicated Turning, Hobbing & Grinding Routings</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Engineering Cost & Margin Breakdown</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold uppercase tracking-widest h-11 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>View Org J Reports</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Organisation G Profile */}
            <Link href="/generic" className="block group">
              <Card className="h-full border-border/60 hover:border-primary/60 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-card flex flex-col justify-between overflow-hidden relative cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500 opacity-80" />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="font-semibold text-[11px] px-2.5 py-0.5">
                      Aerospace & Precision
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Organisation G
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium">
                    High-Precision Component Manufacturing
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-sm flex-1 flex flex-col justify-between">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Aerospace-grade routing across 30+ process families — EDM, laser, waterjet, composites, bearing manufacture, and precision multi-axis machining.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Validated Route Plans</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Wire EDM, Sinker EDM & Laser Sequences</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Aerospace Precision & Composite Profiles</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold uppercase tracking-widest h-11 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>View Org G Reports</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Organisation A Profile */}
            <Link href="/almity" className="block group">
              <Card className="h-full border-border/60 hover:border-primary/60 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-card flex flex-col justify-between overflow-hidden relative cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-indigo-500 opacity-80" />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                      <Layers className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="font-semibold text-[11px] px-2.5 py-0.5">
                      Precision Component Profile
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Organisation A
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium">
                    Org A Precision Components
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-sm flex-1 flex flex-col justify-between">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Automotive turned & milled components, multi-setup VMC machining, surface treatments, and setup-based costing.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Full Characteristic & GD&T Extraction</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Multi-Setup VMC & Lathe Route Operations</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span>Component Spec & Setup Quote Analysis</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold uppercase tracking-widest h-11 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>View Org A Reports</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

