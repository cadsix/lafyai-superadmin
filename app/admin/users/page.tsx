import { api } from "@/lib/api";
import { UsersPage } from "@/components/admin/pages/users-page";
import type { UserListItem } from "@/lib/types";

export const metadata = { title: "User management — lafyai super admin" };

type UsersResponse = {
  total_users: number;
  filtered_count: number;
  data: UserListItem[];
};

export default async function Page() {
  const data = await api
    .get<UsersResponse>("/admin/users")
    .catch(() => null);

  return <UsersPage users={data?.data ?? []} />;
}
