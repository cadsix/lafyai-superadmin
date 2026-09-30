import { api } from "@/lib/api";
import { ProgramsPage } from "@/components/admin/pages/programs-page";
import type { ProgramListItem } from "@/lib/types";

export const metadata = { title: "Programs — GetVaxxed super admin" };

type ProgramsResponse = {
  summary: unknown;
  data: ProgramListItem[];
};

export default async function Page() {
  const data = await api
    .get<ProgramsResponse>("/admin/programs")
    .catch(() => null);

  return <ProgramsPage programs={data?.data ?? []} />;
}
