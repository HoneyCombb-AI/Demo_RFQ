import { notFound } from "next/navigation"
import { getPartsList, getReportData } from "@/lib/server-data"
import { ReportLayout } from "@/components/report/ReportLayout"
import { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getReportData(slug)
  
  if (!data) {
    return { title: "Report Not Found" }
  }
  
  return {
    title: `${data.featureGraph.part.drawing_number} | RFQ Report`,
    description: `Manufacturing analysis report for ${data.featureGraph.part.name}`,
  }
}

export async function generateStaticParams() {
  const parts = await getPartsList()
  return parts.map((part) => ({
    slug: part.slug,
  }))
}

export default async function ReportPage({ params }: Props) {
  // Await the params for Next.js 15+ App Router rules
  const { slug } = await params
  
  const data = await getReportData(slug)

  if (!data) {
    notFound()
  }

  return <ReportLayout data={data} />
}
