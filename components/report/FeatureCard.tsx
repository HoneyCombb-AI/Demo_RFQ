import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Feature, SpecItem } from "@/lib/data"
import { ParamBadge } from "./ParamBadge"
import { ToleranceTable } from "./ToleranceTable"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Compass, Sparkles, Navigation, Layers } from "lucide-react"

interface FeatureCardProps {
  feature: Feature
  specs: SpecItem[]
}

export function FeatureCard({ feature, specs }: FeatureCardProps) {
  const g = feature.geometry || {}

  return (
    <Card className="mb-6 overflow-hidden rounded-lg border border-border border-l-4 shadow-sm bg-background">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50/50 font-mono font-bold text-sm px-2.5 py-0.5 rounded-sm shadow-none">
            {feature.feature_id}
          </Badge>
          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50/50 uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-sm shadow-none font-semibold">
            {feature.feature_type.replace(/_/g, " ")}
          </Badge>
          <h3 className="text-lg font-bold text-foreground">{feature.name}</h3>
        </div>

        {/* Description */}
        {feature.description && (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {feature.description}
          </p>
        )}

        {/* Geometry Badges */}
        <div className="flex flex-wrap gap-2">
          <ParamBadge label="OD" value={g.outer_diameter_mm || g.diameter_mm} unit="mm" />
          <ParamBadge label="ID" value={g.inner_diameter_mm} unit="mm" />
          <ParamBadge label="LENGTH" value={g.length_mm} unit="mm" />
          <ParamBadge label="WIDTH" value={g.width_mm} unit="mm" />
          <ParamBadge label="DEPTH" value={g.depth_mm} unit="mm" />
          <ParamBadge label="HEIGHT" value={g.height_mm} unit="mm" />
          <ParamBadge label="RADIUS" value={g.radius_mm} unit="mm" />
          <ParamBadge label="ANGLE" value={g.angle_deg} unit="°" />
          <ParamBadge label="PITCH" value={g.pitch_mm} unit="mm" />
          <ParamBadge label="PCD" value={g.pcd_mm} unit="mm" />
          <ParamBadge label="HOLES" value={g.hole_count} />
          <ParamBadge label="WALL THICKNESS" value={g.wall_thickness_mm} unit="mm" />
          <ParamBadge label="THREAD CLASS" value={g.thread_class} />
          <ParamBadge label="TAPER ANGLE" value={g.taper_included_angle_deg} unit="°" />
          <ParamBadge label="AREA" value={g.area_mm2} unit="mm²" />
          <ParamBadge label="PROFILE L" value={g.profile_length_mm} unit="mm" />
          {g.depth_condition && <ParamBadge label="DEPTH COND" value={g.depth_condition} />}
          {g.axis_direction && <ParamBadge label="AXIS" value={g.axis_direction} />}
        </div>

        {/* Position Note */}
        {g.position_description && (
          <p className="text-xs italic text-muted-foreground bg-muted/20 p-2.5 rounded-md border">
            <span className="font-semibold text-foreground not-italic">Position:</span> {g.position_description}
          </p>
        )}

        {/* Dimensional Tolerances Table */}
        {feature.dimensional_tolerances && feature.dimensional_tolerances.length > 0 && (
          <div>
            <ToleranceTable tolerances={feature.dimensional_tolerances} />
          </div>
        )}

        {/* GD&T Controls Section */}
        {feature.gdt_controls && feature.gdt_controls.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>GD&T Geometric Controls</span>
            </div>
            <div className="rounded-lg border bg-background shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50/50 hover:bg-indigo-50/50 border-b-2 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900">
                    <TableHead className="w-[25%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">Control Type</TableHead>
                    <TableHead className="w-[20%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">Tolerance Value</TableHead>
                    <TableHead className="w-[20%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">Datum Ref</TableHead>
                    <TableHead className="w-[35%] text-[11px] font-bold tracking-wider uppercase text-foreground/80">Applied Feature / Zone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feature.gdt_controls.map((gdt, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-xs uppercase text-indigo-700 dark:text-indigo-300">
                        {gdt.gdt_type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-bold text-foreground">
                        {gdt.tolerance_value_mm} mm
                        {gdt.material_condition && (
                          <span className="text-xs font-mono text-muted-foreground ml-1.5">({gdt.material_condition})</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {gdt.datum_references && gdt.datum_references.length > 0 ? (
                          <div className="flex gap-1">
                            {gdt.datum_references.map((d, dIdx) => (
                              <span key={dIdx} className="bg-primary/10 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded text-[10px]">
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {gdt.applied_to || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Surface Finish Section */}
        {feature.surface_finish && (
          <div className="flex items-center gap-3 text-xs bg-muted/30 p-3 rounded-md border">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="flex-1 flex flex-wrap items-center gap-3">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">Surface Finish:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {feature.surface_finish.finish_symbol}
              </Badge>
              {feature.surface_finish.ra_value !== null && feature.surface_finish.ra_value !== undefined && (
                <span className="font-mono font-medium">Ra {feature.surface_finish.ra_value} µm</span>
              )}
              {feature.surface_finish.notes && (
                <span className="text-muted-foreground">({feature.surface_finish.notes})</span>
              )}
            </div>
          </div>
        )}

        {/* Access Directions & Metadata Footer */}
        <div className="text-xs text-muted-foreground pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
          {feature.access_directions && feature.access_directions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-foreground">Access:</span>
              <div className="flex gap-1">
                {feature.access_directions.map((dir, dirIdx) => (
                  <Badge key={dirIdx} variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/30">
                    {dir}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {feature.material_condition && (
            <div>
              <span className="font-semibold text-foreground">Condition:</span> {feature.material_condition}
            </div>
          )}

          {feature.source_views && feature.source_views.length > 0 && (
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-muted-foreground" />
              <span>{feature.source_views.join(", ")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
