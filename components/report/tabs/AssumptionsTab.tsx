import * as React from "react"
import { ReportData } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

export function AssumptionsTab({ data }: { data: ReportData }) {
  const assumptions = data.feasibility.assumptions || []

  if (assumptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Info className="w-12 h-12 mb-4 text-muted/50" />
        <h3 className="text-lg font-medium mb-1">No Assumptions Made</h3>
        <p className="text-sm">The analysis was completed without requiring any assumptions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <h2 className="text-lg font-semibold mb-2">Working Assumptions ({assumptions.length})</h2>
      <p className="text-sm text-muted-foreground mb-6">
        The following assumptions were made during analysis to proceed in the absence of explicit data.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {assumptions.map((assumption) => {
          let impactColor = "bg-secondary text-secondary-foreground"
          if (assumption.impact.toLowerCase() === "high") {
            impactColor = "bg-destructive/10 text-destructive border-destructive/20"
          } else if (assumption.impact.toLowerCase() === "medium") {
            impactColor = "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }

          return (
            <Card key={assumption.assumption_id} className="overflow-hidden">
              <CardContent className="p-5 flex flex-col md:flex-row gap-5">
                {/* Left col - IDs and badges */}
                <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:w-32 shrink-0">
                  <Badge variant="outline" className="font-mono bg-muted/30 w-full justify-center text-sm py-1">
                    {assumption.assumption_id}
                  </Badge>
                  <Badge className={`uppercase text-[10px] w-full justify-center tracking-wider border ${impactColor}`}>
                    {assumption.impact} IMPACT
                  </Badge>
                  <div className="text-xs text-muted-foreground text-center w-full font-mono mt-1 hidden md:block">
                    Confidence: {(assumption.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Right col - Content */}
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {assumption.text}
                  </p>
                  
                  {assumption.applies_to && assumption.applies_to.length > 0 && (
                    <div className="pt-3 border-t">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mr-1">
                          Applies To:
                        </span>
                        {assumption.applies_to.map((item) => (
                          <Badge key={item} variant="secondary" className="font-mono text-[10px]">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
