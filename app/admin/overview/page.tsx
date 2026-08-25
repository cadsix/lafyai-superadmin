import { api } from "@/lib/api";
import { OverviewPage } from "@/components/admin/pages/overview-page";
import type { OverviewSummary, OverviewTrendPoint } from "@/lib/types";

export const metadata = {
  title: "National overview — lafyai super admin",
  description: "National immunization rollup across all implementors.",
};

export default async function Page() {
  const [summary, trends] = await Promise.all([
    api.get<OverviewSummary>("/admin/overview/summary").catch(() => null),
    api
      .get<{ data_points: OverviewTrendPoint[] }>(
        "/admin/overview/trends?period=6m&granularity=monthly",
      )
      .catch(() => null),
  ]);

  return <OverviewPage summary={summary} trends={trends?.data_points ?? []} />;
}
