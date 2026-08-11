import { SeAlertsPage } from "@/components/admin/pages/se-alerts-page";

export const metadata = {
  title: "Safety event oversight — lafyai super admin",
  description: "Cross-implementor safety event alerts with severity and escalation status.",
};

export default function Page() {
  return <SeAlertsPage />;
}
