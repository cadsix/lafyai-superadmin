import { api } from "@/lib/api";
import { ImplementorsPage } from "@/components/admin/pages/implementors-page";
import type { ImplementorListItem } from "@/lib/types";

export const metadata = { title: "Implementors — GetVaxxed super admin" };

export default async function Page() {
  const data = await api
    .get<{ data: ImplementorListItem[]; pagination: unknown }>(
      "/admin/implementors?page=1&limit=100",
    )
    .catch(() => null);

  return <ImplementorsPage implementors={data?.data ?? []} />;
}
