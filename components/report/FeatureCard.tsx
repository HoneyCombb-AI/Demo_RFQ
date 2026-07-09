import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Feature, SpecItem } from "@/lib/data"
import { ParamBadge } from "./ParamBadge"
import { ToleranceTable } from "./ToleranceTable"

interface FeatureCardProps {
  feature: Feature
  specs: SpecItem[]
}

export function FeatureCard({ feature, specs }: FeatureCardProps) {
  const g = feature.geometry

  return (
    <Card className="mb-6 overflow-hidden rounded-lg border border-border border-l-4 shadow-sm bg-background">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50/50 font-mono font-bold text-sm px-2 py-0.5 rounded-sm shadow-none">
            {feature.feature_id}
          </Badge>
          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50/50 uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-sm shadow-none">
            {feature.feature_type.replace(/_/g, " ")}
          </Badge>
          <h3 className="text-lg font-semibold ml-2">{feature.name}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">
          {feature.description}
        </p>

        {/* Geometry Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <ParamBadge label="OD" value={g.outer_diameter_mm || g.diameter_mm} unit="mm" />
          <ParamBadge label="ID" value={g.inner_diameter_mm} unit="mm" />
          <ParamBadge label="LENGTH" value={g.length_mm} unit="mm" />
          <ParamBadge label="WIDTH" value={g.width_mm} unit="mm" />
          <ParamBadge label="DEPTH" value={g.depth_mm} unit="mm" />
          <ParamBadge label="HEIGHT" value={g.height_mm} unit="mm" />
          <ParamBadge label="AREA" value={g.area_mm2} unit="mm²" />
          <ParamBadge label="ANGLE" value={g.angle_deg} unit="°" />
          <ParamBadge label="PROFILE L" value={g.profile_length_mm} unit="mm" />
        </div>

        {/* Position Note */}
        {g.position_description && (
          <p className="text-sm italic text-muted-foreground mb-4">
            {g.position_description}
          </p>
        )}

        {/* Tolerances Table */}
        {feature.dimensional_tolerances && feature.dimensional_tolerances.length > 0 && (
          <div className="mb-4">
            <ToleranceTable tolerances={feature.dimensional_tolerances} />
          </div>
        )}

        {/* Conditions & Views */}
        <div className="text-xs text-muted-foreground mt-4 space-y-1 bg-muted/30 p-3 rounded-md">
          {feature.material_condition && (
            <div>
              <span className="font-semibold text-foreground">Condition:</span> {feature.material_condition}
            </div>
          )}
          {feature.source_views && feature.source_views.length > 0 && (
            <div>
              <span className="font-semibold text-foreground">Views:</span> {feature.source_views.join(", ")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
