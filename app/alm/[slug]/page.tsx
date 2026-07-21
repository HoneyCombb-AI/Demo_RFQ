import { notFound } from "next/navigation"
import { getPartsList, getReportData } from "@/lib/server-data"
import { ReportLayout } from "@/components/report/ReportLayout"
import { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getReportData(slug, "alm")

  if (!data) {
    return { title: "Report Not Found" }
  }

  return {
    title: `${data.featureGraph.part.drawing_number} | RFQ Report`,
    description: `Manufacturing analysis report for ${data.featureGraph.part.name}`,
  }
}

export async function generateStaticParams() {
  const parts = await getPartsList("alm")
  return parts.map((part) => ({
    slug: part.slug,
  }))
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params

  const data = await getReportData(slug, "alm")

  if (!data) {
    notFound()
  }

  return <ReportLayout data={data} />
}
