"use client"

import * as React from "react"
import { ReportData, formatTime, formatMachineFamily } from "@/lib/data"
import { ParamBadge } from "../ParamBadge"
import { SetupCard } from "../SetupCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InteractiveSetup,
  AVAILABLE_MACHINES,
  simulateAiRecalibration,
  RecalibrationResult,
  getMachineMeta,
} from "@/lib/engineer-workflow"
import {
  Sparkles,
  Bot,
  RotateCcw,
  Plus,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Info,
  Check,
  Cpu,
  Loader2,
} from "lucide-react"

interface RoutingTabProps {
  data: ReportData
  interactiveSetups: InteractiveSetup[]
  onUpdateSetups: (setups: InteractiveSetup[]) => void
  onResetSetups: () => void
  isCustomized: boolean
}

export function RoutingTab({
  data,
  interactiveSetups,
  onUpdateSetups,
  onResetSetups,
  isCustomized,
}: RoutingTabProps) {
  const stock = data.deconstructedRoute.stock
  const route = data.deconstructedRoute.route

  // AI Prompt & Recalibration state
  const [promptText, setPromptText] = React.useState("")
  const [isRecalibrating, setIsRecalibrating] = React.useState(false)
  const [recalibrationPhase, setRecalibrationPhase] = React.useState("")
  const [lastRecalibration, setLastRecalibration] = React.useState<RecalibrationResult | null>(null)

  // Add Process Modal state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [newOpName, setNewOpName] = React.useState("")
  const [newOpMachine, setNewOpMachine] = React.useState("hmc_4axis")
  const [newOpCycleSec, setNewOpCycleSec] = React.useState("60")
  const [newOpSetupMin, setNewOpSetupMin] = React.useState("15")
  const [newOpWorkholding, setNewOpWorkholding] = React.useState("Dedicated Fixture Plate with Mitee-Bite Clamps")
  const [newOpNote, setNewOpNote] = React.useState("Added by Manufacturing Engineer for specialized machining.")
  const [newOpInHouse, setNewOpInHouse] = React.useState(true)

  // Demo suggested prompts
  const SUGGESTED_PROMPTS = [
    {
      label: "Use CNC instead of VMC",
      text: "Please use a CNC machine instead of standard 3-axis VMC for Datum A and contour profiling.",
    },
    {
      label: "Remove OD grinding & verify finish",
      text: "This part is a flat plate; there can't be OD grinding. Please remove any grinding and verify mill finish.",
    },
    {
      label: "Establish Datum A first",
      text: "Re-order the route so that blanking is followed immediately by Datum A facing before any contour profile.",
    },
    {
      label: "Add vacuum fixture workholding",
      text: "To avoid distortion on this 2mm aluminium plate, use custom vacuum fixture workholding for the main profile.",
    },
  ]

  // Recalculate summary metrics from interactive setups
  const totalSetups = interactiveSetups.length
  const totalSubOperations = interactiveSetups.reduce((acc, s) => acc + s.sub_operations_count, 0)
  const totalMachiningTimeSec = interactiveSetups.reduce((acc, s) => acc + s.cycle_time_sec, 0)
  const totalMachiningTimeMin = totalMachiningTimeSec / 60
  const totalSetupTimeMin = interactiveSetups.reduce((acc, s) => acc + s.setup_time_min, 0)
  const totalCycleTimeMin = totalMachiningTimeMin

  // Handle AI Recalibration trigger
  const handleRecalibrate = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || promptText
    if (!promptToUse.trim()) return

    setIsRecalibrating(true)
    setRecalibrationPhase("Analyzing workpiece envelope & tool clearance constraints...")

    // Simulated multi-stage progress for high-polish live demonstration
    await new Promise((r) => setTimeout(r, 600))
    setRecalibrationPhase("Re-sequencing datum hierarchy & machine allocations...")
    await new Promise((r) => setTimeout(r, 700))
    setRecalibrationPhase("Optimizing speeds, feeds & recalculating cycle times...")
    await new Promise((r) => setTimeout(r, 600))

    const result = simulateAiRecalibration(interactiveSetups, promptToUse, data)
    onUpdateSetups(result.newSetups)
    setLastRecalibration(result)
    setIsRecalibrating(false)
    setRecalibrationPhase("")
    setPromptText("")
  }

  // Handle machine selection change on a setup
  const handleMachineChange = (index: number, newFamily: string) => {
    const machineMeta = getMachineMeta(newFamily)
    const updated = [...interactiveSetups]
    updated[index] = {
      ...updated[index],
      machine_family: newFamily,
      hourly_rate_inr: machineMeta.defaultHourlyRate,
      is_edited: true,
      setup_name: updated[index].setup_name.includes("–")
        ? `${machineMeta.shortName} – ${updated[index].setup_name.split("–")[1].trim()}`
        : updated[index].setup_name,
    }
    onUpdateSetups(updated)
  }

  // Handle reordering
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...interactiveSetups]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    updated.forEach((s, i) => {
      s.sequence = i + 1
      s.is_edited = true
    })
    onUpdateSetups(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index >= interactiveSetups.length - 1) return
    const updated = [...interactiveSetups]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    updated.forEach((s, i) => {
      s.sequence = i + 1
      s.is_edited = true
    })
    onUpdateSetups(updated)
  }

  const handleDelete = (index: number) => {
    if (interactiveSetups.length <= 1) return
    const updated = [...interactiveSetups]
    updated.splice(index, 1)
    updated.forEach((s, i) => {
      s.sequence = i + 1
      s.is_edited = true
    })
    onUpdateSetups(updated)
  }

  // Handle Add Process submission
  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOpName.trim()) return

    const machineMeta = getMachineMeta(newOpMachine)
    const cycleSec = parseFloat(newOpCycleSec) || 45
    const setupMin = parseFloat(newOpSetupMin) || 15

    const newSetup: InteractiveSetup = {
      setup_id: `CUSTOM-${Date.now().toString().slice(-4)}`,
      sequence: interactiveSetups.length + 1,
      setup_name: newOpName.trim(),
      machine_family: newOpMachine,
      in_house: newOpInHouse,
      outside_process: !newOpInHouse,
      setup_time_min: setupMin,
      cycle_time_sec: cycleSec,
      hourly_rate_inr: machineMeta.defaultHourlyRate,
      workholding_method: newOpWorkholding.trim(),
      setup_note: newOpNote.trim(),
      datum_references: ["A"],
      sub_operations_count: 1,
      is_custom: true,
      is_edited: true,
    }

    onUpdateSetups([...interactiveSetups, newSetup])
    setIsAddModalOpen(false)
    setNewOpName("")
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* 1. AI ROUTING CO-PILOT & ENGINEERING FEEDBACK CARD */}
      {/* ========================================================================= */}
      <Card className="border-primary/30 shadow-md bg-linear-to-br from-primary/5 via-background to-background overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Bot className="w-36 h-36 text-primary" />
        </div>

        <CardHeader className="pb-3 border-b border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  AI Routing Co-Pilot &amp; Engineering Guidance
                  {isCustomized && (
                    <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/30">
                      LIVE RECALIBRATED
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Instruct the AI to adjust machine choice, change sequence priority, or re-evaluate tooling constraints.
                </CardDescription>
              </div>
            </div>

            {isCustomized && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetSetups}
                className="text-xs font-mono h-8 border-muted-foreground/30 hover:border-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset to Baseline
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Natural Language Feedback Text Area */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Give engineering instructions (e.g. 'Use CNC instead of VMC', 'The first step should be blanking, no OD grinding', 'Add vacuum fixture to avoid bending')..."
                rows={2}
                disabled={isRecalibrating}
                className="w-full text-xs font-sans p-3 pr-28 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none shadow-2xs leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleRecalibrate()
                  }
                }}
              />
              <div className="absolute right-2.5 bottom-2.5">
                <Button
                  size="sm"
                  onClick={() => handleRecalibrate()}
                  disabled={isRecalibrating || !promptText.trim()}
                  className="h-8 text-xs font-semibold uppercase tracking-wider px-3.5 shadow-sm"
                >
                  {isRecalibrating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Recalibrating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Recalibrate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Simulated Live Reasoning State */}
            {isRecalibrating && (
              <div className="flex items-center gap-2.5 p-3 rounded-md bg-primary/10 border border-primary/20 text-xs font-mono text-primary animate-pulse">
                <Cpu className="w-4 h-4 animate-spin shrink-0" />
                <span>{recalibrationPhase}</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <span>Quick Engineer Prompts (Click to Demo):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((chip, idx) => (
                <button
                  key={`chip-${idx}`}
                  type="button"
                  disabled={isRecalibrating}
                  onClick={() => {
                    setPromptText(chip.text)
                    handleRecalibrate(chip.text)
                  }}
                  className="text-[11px] font-sans text-left bg-background hover:bg-muted/80 border border-border/80 hover:border-primary/50 text-foreground px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer group disabled:opacity-50"
                >
                  <span className="text-primary group-hover:scale-110 transition-transform">⚡</span>
                  <span className="font-medium">{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Last Recalibration Summary Toast */}
          {lastRecalibration && (
            <div className="p-3.5 rounded-lg bg-background border border-emerald-500/40 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  AI Recalibration Complete
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {lastRecalibration.timeDeltaMin < 0
                    ? `${Math.abs(lastRecalibration.timeDeltaMin * 60).toFixed(0)}s saved per piece`
                    : "Route optimized for fixture rigidity"}
                </div>
              </div>

              <ul className="text-xs text-foreground/90 space-y-1 pl-4 list-disc marker:text-emerald-500">
                {lastRecalibration.changesSummary.map((c, i) => (
                  <li key={`chg-${i}`}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SUMMARY STATS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/10 border-border/80">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Setups</div>
            <div className="text-2xl font-bold font-mono text-foreground flex items-center justify-center gap-1.5">
              {totalSetups}
              {isCustomized && (
                <span className="text-[11px] font-sans font-normal text-muted-foreground">
                  ({totalSetups !== data.computedRoute.total_summary.total_setups ? `${totalSetups - data.computedRoute.total_summary.total_setups > 0 ? "+" : ""}${totalSetups - data.computedRoute.total_summary.total_setups}` : "tuned"})
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/10 border-border/80">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Sub-Operations</div>
            <div className="text-2xl font-bold font-mono text-foreground">{totalSubOperations}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">Total Machining</div>
            <div className="text-2xl font-bold font-mono text-primary">{formatTime(totalMachiningTimeMin)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{totalMachiningTimeSec.toFixed(1)} sec/pc</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">Total Cycle</div>
            <div className="text-2xl font-bold font-mono text-primary">{formatTime(totalCycleTimeMin)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">+ {formatTime(totalSetupTimeMin)} batch setup</div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. STOCK SELECTION & ROUTE OVERVIEW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card border rounded-lg p-6 shadow-xs">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Stock Selection</h3>
          {stock.material && (
            <div className="mb-4">
              <h4 className="font-semibold text-lg">{stock.material}</h4>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-5">
            {stock.form && <ParamBadge label="FORM" value={stock.form.replace(/_/g, " ")} />}
            {stock.starting_dimensions.diameter_mm != null && (
              <ParamBadge label="Ø OD" value={stock.starting_dimensions.diameter_mm} unit="mm" />
            )}
            {stock.starting_dimensions.bore_diameter_mm != null && (
              <ParamBadge label="Ø ID" value={stock.starting_dimensions.bore_diameter_mm} unit="mm" />
            )}
            {stock.starting_dimensions.length_mm != null && (
              <ParamBadge label="L" value={stock.starting_dimensions.length_mm} unit="mm" />
            )}
            {stock.machining_allowance_mm != null && (
              <ParamBadge label="ALLOWANCE" value={stock.machining_allowance_mm} unit="mm" />
            )}
          </div>
          {stock.why && <p className="text-sm text-muted-foreground leading-relaxed">{stock.why}</p>}
        </section>

        <section className="bg-card border rounded-lg p-6 shadow-xs">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Route Strategy</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {route.part_family && <ParamBadge label="FAMILY" value={route.part_family} />}
            {route.base_geometry && <ParamBadge label="GEOMETRY" value={route.base_geometry} />}
          </div>
          {route.route_reason && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{route.route_reason}</p>
          )}
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 4. MANUFACTURING ROUTE SETUPS LIST WITH INTERACTIVE OVERRIDES */}
      {/* ========================================================================= */}
      <section className="mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Manufacturing Route
              <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full font-mono">
                {interactiveSetups.length} Operations
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Change machine family via dropdowns, reorder steps with arrows, or insert new custom operations.
            </p>
          </div>

          {/* Add Operation Dialog Trigger */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger render={
              <Button size="sm" className="font-semibold text-xs tracking-wider uppercase h-9">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Machine / Process
              </Button>
            } />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Custom Manufacturing Step</DialogTitle>
                <DialogDescription>
                  Define a new process or machine operation to insert into the manufacturing route.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddProcess} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Operation Name</label>
                  <input
                    type="text"
                    required
                    value={newOpName}
                    onChange={(e) => setNewOpName(e.target.value)}
                    placeholder="e.g., BMC 4-Axis – Precision Hole Boring & Chamfer"
                    className="w-full text-xs p-2.5 rounded-md border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Machine Family</label>
                    <select
                      value={newOpMachine}
                      onChange={(e) => setNewOpMachine(e.target.value)}
                      className="w-full text-xs p-2 rounded-md border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                    >
                      {AVAILABLE_MACHINES.map((m) => (
                        <option key={m.family} value={m.family}>
                          {m.displayName} (₹{m.defaultHourlyRate}/hr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Process Scope</label>
                    <select
                      value={newOpInHouse ? "in_house" : "outside"}
                      onChange={(e) => setNewOpInHouse(e.target.value === "in_house")}
                      className="w-full text-xs p-2 rounded-md border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="in_house">In-House Manufacturing</option>
                      <option value="outside">Outside Process / Vendor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Cycle Time (seconds)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={newOpCycleSec}
                      onChange={(e) => setNewOpCycleSec(e.target.value)}
                      className="w-full text-xs p-2 rounded-md border bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Setup Time (minutes)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={newOpSetupMin}
                      onChange={(e) => setNewOpSetupMin(e.target.value)}
                      className="w-full text-xs p-2 rounded-md border bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Workholding / Fixture Method</label>
                  <input
                    type="text"
                    value={newOpWorkholding}
                    onChange={(e) => setNewOpWorkholding(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Engineering Note</label>
                  <textarea
                    rows={2}
                    value={newOpNote}
                    onChange={(e) => setNewOpNote(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Add to Route
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Setups Timeline */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
          {interactiveSetups.map((setup, idx) => {
            // Find base deconstructed setup if available
            const dSetup =
              setup.raw_deconstructed_setup ||
              route.setups.find((s) => s.setup_id === setup.setup_id) || {
                setup_id: setup.setup_id,
                sequence: setup.sequence,
                setup_name: setup.setup_name,
                machine_family: setup.machine_family,
                machine_reason: setup.setup_note || setup.setup_name,
                workholding: {
                  method: setup.workholding_method || "Standard Clamping",
                  grip_description: setup.workholding_method || "",
                  special_fixture_required: false,
                  fixture_notes: null,
                },
                datum_references: setup.datum_references || [],
                stock_state_before: "Initial Stock",
                stock_state_after: "Machined Geometry",
                access_directions: ["+Z"],
                sub_operations: [],
              }

            // Create synthetic computed setup object
            const cSetup = setup.raw_computed_setup || {
              setup_id: setup.setup_id,
              sequence: setup.sequence,
              setup_name: setup.setup_name,
              machine_family: setup.machine_family,
              in_house: setup.in_house,
              outside_process: setup.outside_process,
              sub_operations: [],
              time_summary: {
                setup_time_min: setup.setup_time_min,
                handling_time_min: 0.1,
                total_cutting_time_min: setup.cycle_time_sec / 60,
                total_non_cutting_time_min: 0.1,
                total_machining_time_min: setup.cycle_time_sec / 60,
                sub_operation_count: setup.sub_operations_count,
                outside_process: setup.outside_process,
              },
            }

            return (
              <div key={`${setup.setup_id}-${idx}`} className="relative z-10">
                <SetupCard
                  computedSetup={{
                    ...cSetup,
                    sequence: setup.sequence,
                    setup_name: setup.setup_name,
                    machine_family: setup.machine_family,
                    time_summary: {
                      ...cSetup.time_summary,
                      total_machining_time_min: setup.cycle_time_sec / 60,
                      setup_time_min: setup.setup_time_min,
                    },
                  }}
                  deconstructedSetup={{
                    ...dSetup,
                    sequence: setup.sequence,
                    setup_name: setup.setup_name,
                    machine_family: setup.machine_family,
                    machine_reason: setup.setup_note || dSetup.machine_reason,
                    workholding: {
                      ...dSetup.workholding,
                      method: setup.workholding_method || dSetup.workholding?.method || "Standard Clamping",
                    },
                  }}
                  sequenceIndex={idx}
                  totalSetups={interactiveSetups.length}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  onDelete={() => handleDelete(idx)}
                  onMachineChange={(newFamily) => handleMachineChange(idx, newFamily)}
                  isEdited={setup.is_edited}
                  isCustom={setup.is_custom}
                  currentHourlyRate={setup.hourly_rate_inr}
                  currentCycleTimeSec={setup.cycle_time_sec}
                />
              </div>
            )
          })}
        </div>

        {/* Bottom Add Operation Button */}
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}
            className="border-dashed border-2 hover:border-primary px-6 py-4 h-auto text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Operation to Route
          </Button>
        </div>
      </section>
    </div>
  )
}
