import { api } from "@/lib/api";
import { BillingPage } from "@/components/admin/pages/billing-page";
import type { BillingMetrics, BillingPlanItem, BillingAccountItem } from "@/lib/types";

export const metadata = { title: "Billing — GetVaxxed super admin" };

type BillingResponse = {
  metrics: BillingMetrics;
  plans: BillingPlanItem[];
  accounts: BillingAccountItem[];
};

export default async function Page() {
  const data = await api.get<BillingResponse>("/admin/billing").catch(() => null);

  return (
    <BillingPage
      metrics={data?.metrics ?? null}
      plans={data?.plans ?? []}
      accounts={data?.accounts ?? []}
    />
  );
}
