import { api } from "@/lib/api";
import { SeAlertsPage } from "@/components/admin/pages/se-alerts-page";
import type { AEFIAlert } from "@/lib/types";

export const metadata = { title: "AEFI Alerts — GetVaxxed super admin" };

type AEFISummary = {
  critical_open: { value: number; sub_label: string | null; most_reported: string | null };
  moderate_open: { value: number; sub_label: string | null; most_reported: string | null };
  mild_open:     { value: number; sub_label: string | null; most_reported: string | null };
};

export default async function Page() {
  const [alerts, summary] = await Promise.all([
    api.get<AEFIAlert[]>("/aefi-alerts/?status_filter=open").catch(() => [] as AEFIAlert[]),
    api.get<AEFISummary>("/aefi-alerts/summary").catch(() => null),
  ]);

  return <SeAlertsPage alerts={alerts} summary={summary} />;
}
