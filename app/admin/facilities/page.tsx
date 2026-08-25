import { api } from "@/lib/api";
import { FacilitiesPage } from "@/components/admin/pages/facilities-page";
import type { FacilityListItem } from "@/lib/types";

export const metadata = { title: "Facilities — lafyai super admin" };

type FacilitiesResponse = {
  summary: unknown;
  data: FacilityListItem[];
  pagination: unknown;
};

export default async function Page() {
  const data = await api
    .get<FacilitiesResponse>("/admin/facilities?page=1&limit=200")
    .catch(() => null);

  return <FacilitiesPage facilities={data?.data ?? []} />;
}
