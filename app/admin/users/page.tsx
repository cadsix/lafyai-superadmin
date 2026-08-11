import { UsersPage } from "@/components/admin/pages/users-page";

export const metadata = {
  title: "User management — lafyai super admin",
  description: "Manage users and roles across every portal.",
};

export default function Page() {
  return <UsersPage />;
}
