"use client"

import * as React from "react"
import { ReportData, formatCurrency } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  initInteractiveSetups,
  InteractiveSetup,
  QuoteCustomization,
} from "@/lib/engineer-workflow"

// Tab panel components
import { SpecsTab } from "./tabs/SpecsTab"
import { FeasibilityTab } from "./tabs/FeasibilityTab"
import { RoutingTab } from "./tabs/RoutingTab"
import { QuoteTab } from "./tabs/QuoteTab"
import { ClarificationsTab } from "./tabs/ClarificationsTab"
import { AssumptionsTab } from "./tabs/AssumptionsTab"

export function ReportTabs({ 
  data, 
  activeTab, 
  onTabChange 
}: { 
  data: ReportData
  activeTab?: string
  onTabChange?: (val: string) => void
}) {
  const specCount = data.specList?.length || 0
  const quoteData = data.quote
  const clarificationsCount = data.feasibility.clarifications?.length || 0

  // 1. Interactive Routing State (shared across Routing & Quote tabs)
  const [setups, setSetups] = React.useState<InteractiveSetup[]>(() =>
    initInteractiveSetups(data)
  )

  // 2. Interactive Quote Customization State
  const [customization, setCustomization] = React.useState<QuoteCustomization>({
    rawMaterialRatePerKg: 320,
    grossWeightKg: quoteData?.weights?.gross_weight_kg && quoteData.weights.gross_weight_kg > 0
      ? quoteData.weights.gross_weight_kg
      : 0.045,
    netWeightKg: quoteData?.weights?.net_weight_kg && quoteData.weights.net_weight_kg > 0
      ? quoteData.weights.net_weight_kg
      : 0.001,
    customMaterialCostPerPiece: undefined,
    useManualMaterialCost: false,
    scrapCreditPct: 10,
    marginPct: 20,
    factoryOverheadPct: 25,
  })

  // Detect whether the engineer has made modifications
  const isCustomized = React.useMemo(() => {
    const initial = initInteractiveSetups(data)
    if (setups.length !== initial.length) return true
    return setups.some((s, i) => {
      const init = initial[i]
      if (!init) return true
      return (
        s.machine_family !== init.machine_family ||
        s.setup_name !== init.setup_name ||
        s.cycle_time_sec !== init.cycle_time_sec ||
        s.is_custom ||
        s.is_edited
      )
    })
  }, [setups, data])

  // Real-time calculation of dynamic price for the header badge
  const dynamicPriceFormatted = React.useMemo(() => {
    const rawMaterialCost = customization.useManualMaterialCost && customization.customMaterialCostPerPiece != null
      ? customization.customMaterialCostPerPiece
      : +(customization.grossWeightKg * customization.rawMaterialRatePerKg).toFixed(2)

    const scrapWeight = Math.max(0, customization.grossWeightKg - customization.netWeightKg)
    const scrapCredit = +(scrapWeight * customization.rawMaterialRatePerKg * (customization.scrapCreditPct / 100)).toFixed(2)
    const netMaterialCost = Math.max(0, +(rawMaterialCost - scrapCredit).toFixed(2))

    const machiningCost = setups.reduce((acc, s) => acc + (s.cycle_time_sec / 3600) * s.hourly_rate_inr, 0)
    const heatTreat = quoteData?.direct_cost?.heat_treatment_cost_inr ?? 0.04
    const directBase = netMaterialCost + machiningCost + heatTreat

    const tooling = directBase * 0.15
    const rejection = directBase * 0.04
    const inspection = directBase * 0.035
    const packaging = 0.50
    const overheadMargin = directBase * (customization.marginPct / 100 + customization.factoryOverheadPct / 100)

    const final = +(directBase + tooling + rejection + inspection + packaging + overheadMargin).toFixed(2)
    return formatCurrency(final, "INR")
  }, [setups, customization, quoteData])

  const [internalTab, setInternalTab] = React.useState("specs")
  const currentTab = activeTab !== undefined ? activeTab : internalTab
  const handleValueChange = (val: string) => {
    setInternalTab(val)
    if (onTabChange) onTabChange(val)
  }

  const handleResetSetups = () => {
    setSetups(initInteractiveSetups(data))
    setCustomization({
      rawMaterialRatePerKg: 320,
      grossWeightKg: quoteData?.weights?.gross_weight_kg && quoteData.weights.gross_weight_kg > 0
        ? quoteData.weights.gross_weight_kg
        : 0.045,
      netWeightKg: quoteData?.weights?.net_weight_kg && quoteData.weights.net_weight_kg > 0
        ? quoteData.weights.net_weight_kg
        : 0.001,
      customMaterialCostPerPiece: undefined,
      useManualMaterialCost: false,
      scrapCreditPct: 10,
      marginPct: 20,
      factoryOverheadPct: 25,
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden" data-tour="report-tabs">
      <Tabs value={currentTab} onValueChange={handleValueChange} className="flex-1 flex flex-col w-full min-h-0">
        
        {/* Tab List Header */}
        <div className="border-b px-6 bg-background pt-2 sticky top-0 z-10 shrink-0">
          <TabsList className="h-12 bg-transparent w-full justify-start overflow-x-auto overflow-y-hidden rounded-none p-0">
            <TabsTrigger 
              value="specs" 
              data-tour="tab-specs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Specs
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{specCount}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="feasibility" 
              data-tour="tab-feasibility"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Feasibility
            </TabsTrigger>
            
            <TabsTrigger 
              value="routing" 
              data-tour="tab-routing"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Routing
              <Badge variant={isCustomized ? "default" : "secondary"} className={`ml-2 font-mono text-[10px] ${isCustomized ? "bg-primary text-primary-foreground" : ""}`}>
                {setups.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="quote" 
              data-tour="tab-quote"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Quote
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{dynamicPriceFormatted}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="clarifications" 
              data-tour="tab-clarifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Clarifications
              {clarificationsCount > 0 && (
                <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
                  {clarificationsCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="assumptions" 
              data-tour="tab-assumptions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Assumptions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Areas */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 relative bg-slate-50 dark:bg-muted/10">
          <TabsContent value="specs" data-tour="specs-content" className="m-0 border-none outline-none">
            <SpecsTab data={data} />
          </TabsContent>
          <TabsContent value="feasibility" data-tour="feasibility-content" className="m-0 border-none outline-none">
            <FeasibilityTab data={data} />
          </TabsContent>
          <TabsContent value="routing" data-tour="routing-content" className="m-0 border-none outline-none">
            <RoutingTab
              data={data}
              interactiveSetups={setups}
              onUpdateSetups={setSetups}
              onResetSetups={handleResetSetups}
              isCustomized={isCustomized}
            />
          </TabsContent>
          <TabsContent value="quote" data-tour="quote-content" className="m-0 border-none outline-none">
            <QuoteTab
              quote={quoteData}
              interactiveSetups={setups}
              onUpdateSetups={setSetups}
              customization={customization}
              onUpdateCustomization={setCustomization}
              partMaterial={data.featureGraph.part.material || "AL 6061-T6510/T6511"}
            />
          </TabsContent>
          <TabsContent value="clarifications" className="m-0 border-none outline-none">
            <ClarificationsTab data={data} />
          </TabsContent>
          <TabsContent value="assumptions" className="m-0 border-none outline-none">
            <AssumptionsTab data={data} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
