import { api } from "@/lib/api";
import { AuditPage } from "@/components/admin/pages/audit-page";
import type { AuditLogGroup } from "@/lib/types";

export const metadata = { title: "Audit log — GetVaxxed super admin" };

export default async function Page() {
  // The API returns a single group object, not an array — normalise to array
  const raw = await api
    .get<AuditLogGroup | AuditLogGroup[]>("/audit-log?page=1&limit=100")
    .catch(() => null);

  const groups: AuditLogGroup[] = !raw
    ? []
    : Array.isArray(raw)
    ? raw
    : [raw];

  return <AuditPage groups={groups} />;
}
