import { api } from "@/lib/api";
import { InsightsPage } from "@/components/admin/pages/insights-page";
import type { InsightsResponse } from "@/lib/types";

export const metadata = { title: "Insights — GetVaxxed super admin" };

export default async function Page() {
  const data = await api.get<InsightsResponse>("/admin/insights").catch(() => null);
  return <InsightsPage data={data} />;
}
