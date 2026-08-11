import { AuditPage } from "@/components/admin/pages/audit-page";

export const metadata = {
  title: "Audit log — lafyai super admin",
  description: "Chronological record of administrative actions.",
};

export default function Page() {
  return <AuditPage />;
}
