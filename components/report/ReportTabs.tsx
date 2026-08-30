"use client"

import * as React from "react"
import { ReportData, formatCurrency } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Tab panel components
import { SpecsTab } from "./tabs/SpecsTab"
import { FeasibilityTab } from "./tabs/FeasibilityTab"
import { RoutingTab } from "./tabs/RoutingTab"
import { QuoteTab } from "./tabs/QuoteTab"
import { SetupQuoteTab } from "./tabs/SetupQuoteTab"
import { ObscQuoteTab } from "./tabs/ObscQuoteTab"
import { JttQuoteTab } from "./tabs/JttQuoteTab"
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
  const riskLevel = data.feasibility.feasibility.risk_level
  const setupCount = data.computedRoute.total_summary.total_setups
  const price = data.quoteFormat === "excel" && data.excelQuote
    ? formatCurrency(data.excelQuote.cost_summary.ex_works_price_per_piece_inr)
    : data.quoteFormat === "obsc" && data.obscQuote
      ? formatCurrency(data.obscQuote.pricing_and_duties.final_landed_price_inr, "INR")
      : data.quoteFormat === "jtt" && data.jttQuote
        ? formatCurrency(data.jttQuote.pricing_summary.final_ex_works_price_inr, "INR")
        : data.setupQuote
          ? formatCurrency(data.setupQuote.summary.final_price_per_piece_inr)
          : "-"
  const clarificationsCount = data.feasibility.clarifications?.length || 0

  const [internalTab, setInternalTab] = React.useState("specs")
  const currentTab = activeTab !== undefined ? activeTab : internalTab
  const handleValueChange = (val: string) => {
    setInternalTab(val)
    if (onTabChange) onTabChange(val)
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
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{setupCount}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="quote" 
              data-tour="tab-quote"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Quote
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{price}</Badge>
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
            <RoutingTab data={data} />
          </TabsContent>
          <TabsContent value="quote" data-tour="quote-content" className="m-0 border-none outline-none">
            {data.quoteFormat === "excel" && data.excelQuote ? (
              <QuoteTab data={data} />
            ) : data.quoteFormat === "obsc" && data.obscQuote ? (
              <ObscQuoteTab quote={data.obscQuote} />
            ) : data.quoteFormat === "jtt" && data.jttQuote ? (
              <JttQuoteTab quote={data.jttQuote} />
            ) : data.setupQuote ? (
              <SetupQuoteTab quote={data.setupQuote} />
            ) : null}
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
