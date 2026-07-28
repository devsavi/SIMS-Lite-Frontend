import { ReportDetailPage } from "@/features/reports";
import type { ReportType } from "@/features/reports/types";

interface DynamicReportPageProps {
  params: Promise<{
    reportType: string;
  }>;
}

export async function generateMetadata({ params }: DynamicReportPageProps) {
  const resolvedParams = await params;
  const title = resolvedParams.reportType.replace("-", " ").toUpperCase();
  return {
    title: `${title} Report | SIMS Lite`,
    description: `Detailed ${title} report and data exports.`,
  };
}

export default async function ReportDetailRoute({ params }: DynamicReportPageProps) {
  const resolvedParams = await params;
  return <ReportDetailPage reportType={resolvedParams.reportType as ReportType} />;
}
