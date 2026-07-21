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
import { ClarificationsTab } from "./tabs/ClarificationsTab"
import { AssumptionsTab } from "./tabs/AssumptionsTab"

export function ReportTabs({ data }: { data: ReportData }) {
  const specCount = data.specList?.length || 0
  const riskLevel = data.feasibility.feasibility.risk_level
  const setupCount = data.computedRoute.total_summary.total_setups
  const price = data.quoteFormat === "excel" && data.excelQuote
    ? formatCurrency(data.excelQuote.cost_summary.ex_works_price_per_piece_inr)
    : data.setupQuote
      ? formatCurrency(data.setupQuote.summary.final_price_per_piece_inr)
      : "-"
  const clarificationsCount = data.feasibility.clarifications?.length || 0
  
  // Badge colors
  let riskColor = "bg-green-100 text-green-700 hover:bg-green-100"
  if (riskLevel.toLowerCase() === "medium") riskColor = "bg-amber-100 text-amber-700 hover:bg-amber-100"
  if (riskLevel.toLowerCase() === "high") riskColor = "bg-red-100 text-red-700 hover:bg-red-100"

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <Tabs defaultValue="specs" className="flex-1 flex flex-col w-full min-h-0">
        
        {/* Tab List Header */}
        <div className="border-b px-6 bg-background pt-2 sticky top-0 z-10 shrink-0">
          <TabsList className="h-12 bg-transparent w-full justify-start overflow-x-auto overflow-y-hidden rounded-none p-0">
            <TabsTrigger 
              value="specs" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Specs
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{specCount}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="feasibility" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Feasibility
              <Badge className={`ml-2 text-[10px] uppercase font-sans ${riskColor}`}>{riskLevel}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="routing" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Routing
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{setupCount}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="quote" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Quote
              <Badge variant="secondary" className="ml-2 font-mono text-[10px]">{price}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="clarifications" 
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
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-transparent data-active:border-b-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none px-4 py-3 text-xs tracking-widest uppercase font-mono font-semibold"
            >
              Assumptions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Areas */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 relative bg-slate-50 dark:bg-muted/10">
          <TabsContent value="specs" className="m-0 border-none outline-none">
            <SpecsTab data={data} />
          </TabsContent>
          <TabsContent value="feasibility" className="m-0 border-none outline-none">
            <FeasibilityTab data={data} />
          </TabsContent>
          <TabsContent value="routing" className="m-0 border-none outline-none">
            <RoutingTab data={data} />
          </TabsContent>
          <TabsContent value="quote" className="m-0 border-none outline-none">
            {data.quoteFormat === "excel" && data.excelQuote ? (
              <QuoteTab data={data} />
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
