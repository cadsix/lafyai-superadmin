import { api } from "@/lib/api";
import { CoveragePage } from "@/components/admin/pages/coverage-page";
import type { CoverageSummary, CoverageAntigenItem } from "@/lib/types";

export const metadata = { title: "Coverage — lafyai super admin" };

type AntigensResponse = {
  items: CoverageAntigenItem[];
  legend: unknown;
};

export default async function Page() {
  const [summary, antigens] = await Promise.all([
    api.get<CoverageSummary>("/coverage/summary").catch(() => null),
    api.get<AntigensResponse>("/coverage/antigens").catch(() => null),
  ]);

  return (
    <CoveragePage
      summary={summary}
      antigens={antigens?.items ?? []}
    />
  );
}
