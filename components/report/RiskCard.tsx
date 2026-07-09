import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeasibilityRisk } from "@/lib/data"

interface RiskCardProps {
  risk: FeasibilityRisk
}

export function RiskCard({ risk }: RiskCardProps) {
  const formattedRiskType = risk.risk_type.replace(/_/g, " ")

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Badge variant="outline" className="uppercase tracking-wider">
              {formattedRiskType}
            </Badge>
          </CardTitle>
          {risk.affected_feature_ids && risk.affected_feature_ids.length > 0 && (
            <div className="flex gap-1">
              {risk.affected_feature_ids.map((id) => (
                <Badge key={id} variant="secondary" className="font-mono text-[10px]">
                  {id}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-3 leading-relaxed">
          {risk.description}
        </p>
        {risk.mitigation && (
          <div className="text-sm border-l-2 border-muted pl-3 py-1">
            <span className="font-semibold text-muted-foreground mr-1">Mitigation:</span>
            <span className="text-muted-foreground">{risk.mitigation}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
