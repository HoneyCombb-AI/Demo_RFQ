import * as React from "react"
import { ReportData } from "@/lib/data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"

export function ClarificationsTab({ data }: { data: ReportData }) {
  const clarifications = data.feasibility.clarifications || []

  if (clarifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <HelpCircle className="w-12 h-12 mb-4 text-muted/50" />
        <h3 className="text-lg font-medium mb-1">No Clarifications Needed</h3>
        <p className="text-sm">The drawing and specifications are fully clear.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <h2 className="text-lg font-semibold mb-2">Required Clarifications ({clarifications.length})</h2>
      <p className="text-sm text-muted-foreground mb-6">
        The following items require clarification from the customer to proceed with manufacturing.
      </p>

      {clarifications.map((clarification) => {
        let priorityColor = "bg-secondary text-secondary-foreground"
        if (clarification.priority.toUpperCase() === "HIGH") {
          priorityColor = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        } else if (clarification.priority.toUpperCase() === "MEDIUM") {
          priorityColor = "border border-amber-500 text-amber-600 bg-amber-50"
        }

        return (
          <Card key={clarification.clarification_id} className="overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono bg-background shadow-sm border">
                    {clarification.clarification_id}
                  </Badge>
                  <h3 className="text-base font-semibold text-foreground leading-tight">
                    {clarification.question}
                  </h3>
                </div>
                <Badge className={`${priorityColor} uppercase text-[10px] tracking-wider shrink-0`}>
                  {clarification.priority} PRIORITY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Why It Matters</h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {clarification.why_it_matters}
                </p>
              </div>

              {clarification.suggested_default && (
                <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-primary mb-1">Suggested Default Assumption</h4>
                  <p className="text-sm text-foreground">
                    {clarification.suggested_default}
                  </p>
                </div>
              )}

              {(clarification.blocks?.length > 0) && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Blocks Analysis For</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {clarification.blocks.map((block) => (
                      <Badge key={block} variant="secondary" className="font-mono text-[10px]">
                        {block}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
