import { FacilitiesPage } from "@/components/admin/pages/facilities-page";

export const metadata = {
  title: "Facilities — lafyai super admin",
  description: "Every facility on the platform with its subscription plan, seats, coverage and active status.",
};

export default function Page() {
  return <FacilitiesPage />;
}
