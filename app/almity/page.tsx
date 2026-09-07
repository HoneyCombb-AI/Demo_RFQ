import * as React from "react"
import Link from "next/link"
import { getPartsList } from "@/lib/server-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowRight, ChevronLeft } from "lucide-react"

export const metadata = {
  title: "Organisation A Reports | RFQ Viewer",
}

export default async function OrgAReportsListPage() {
  const parts = await getPartsList("almity")

  return (
    <div className="min-h-screen bg-muted/20 p-8 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">

        <header>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Organizations
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold border-blue-500/30 text-blue-600 bg-blue-500/5">
              Organisation A
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">RFQ Analysis Reports</h1>
          <p className="text-muted-foreground">Select a part to view its detailed manufacturing analysis report.</p>
        </header>

        {parts.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-lg border border-dashed">
            <p className="text-muted-foreground">No reports found in the data directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => (
              <Link key={part.slug} href={`/almity/${part.slug}`} className="block group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group-hover:-translate-y-1 duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        RFQ
                      </Badge>
                    </div>
                    <CardTitle className="font-mono text-lg">{part.folderName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs font-semibold text-primary uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Report <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
