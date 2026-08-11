import { BillingPage } from "@/components/admin/pages/billing-page";

export const metadata = {
  title: "Billing & subscription — lafyai super admin",
  description: "Subscription plans, billing accounts and invoice status across the platform.",
};

export default function Page() {
  return <BillingPage />;
}
