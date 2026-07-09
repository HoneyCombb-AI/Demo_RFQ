import * as React from "react"
import { ReportData, formatTime } from "@/lib/data"
import { ParamBadge } from "../ParamBadge"
import { SetupCard } from "../SetupCard"
import { Card, CardContent } from "@/components/ui/card"

export function RoutingTab({ data }: { data: ReportData }) {
  const stock = data.deconstructedRoute.stock
  const route = data.deconstructedRoute.route
  const computed = data.computedRoute

  return (
    <div className="space-y-8 pb-12">
      {/* Stock Selection & Route Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* STOCK SELECTION */}
        <section className="bg-card border rounded-lg p-6 shadow-sm">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Stock Selection</h3>
          <div className="mb-4">
            <h4 className="font-semibold text-lg">{stock.material}</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <ParamBadge label="FORM" value={stock.form.replace(/_/g, " ")} />
            <ParamBadge label="Ø" value={stock.starting_dimensions.diameter_mm} unit="mm" />
            <ParamBadge label="L" value={stock.starting_dimensions.length_mm} unit="mm" />
            <ParamBadge label="ALLOWANCE" value={stock.machining_allowance_mm} unit="mm" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stock.why}
          </p>
        </section>

        {/* ROUTE OVERVIEW */}
        <section className="bg-card border rounded-lg p-6 shadow-sm">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Route Overview</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            <ParamBadge label="FAMILY" value={route.part_family} />
            <ParamBadge label="GEOMETRY" value={route.base_geometry} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {route.route_reason}
          </p>
        </section>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/10">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Setups</div>
            <div className="text-2xl font-bold font-mono">{computed.total_summary.total_setups}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Sub-Operations</div>
            <div className="text-2xl font-bold font-mono">{computed.total_summary.total_sub_operations}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">Total Machining</div>
            <div className="text-2xl font-bold font-mono">{formatTime(computed.total_summary.total_machining_time_min)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Total Setup</div>
            <div className="text-2xl font-bold font-mono">{formatTime(computed.total_summary.total_setup_time_min)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Cards List */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          Manufacturing Route
          <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {computed.setups.length} Steps
          </span>
        </h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {computed.setups.map((cSetup) => {
            const dSetup = route.setups.find((s) => s.setup_id === cSetup.setup_id)
            if (!dSetup) return null
            return (
              <div key={cSetup.setup_id} className="relative z-10">
                <SetupCard computedSetup={cSetup} deconstructedSetup={dSetup} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
