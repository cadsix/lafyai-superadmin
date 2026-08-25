import { AdminShell } from "@/components/admin/admin-shell";
import { AuthProvider } from "@/lib/auth-context";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AEFIAlert } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session and open AEFI alerts in parallel
  const [user, alerts] = await Promise.all([
    getSession(),
    api.get<AEFIAlert[]>("/aefi-alerts/?status_filter=open").catch(() => [] as AEFIAlert[]),
  ]);

  return (
    <AuthProvider user={user}>
      <AdminShell alerts={alerts}>{children}</AdminShell>
    </AuthProvider>
  );
}
