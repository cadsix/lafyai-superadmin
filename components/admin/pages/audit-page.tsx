// TODO: Replace AUDIT_LOG_STUB with a real API fetch
// e.g. GET /api/admin/audit-log — this can be a server component once you wire the endpoint

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AUDIT_LOG_STUB } from "@/lib/admin-data";

export function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Administrative actions across the platform." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT_LOG_STUB.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{row.action.replace(/_/g, " ")}</TableCell>
                  <TableCell>{row.actor_email || "system"}</TableCell>
                  <TableCell>{row.target || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.detail || "—"}</TableCell>
                </TableRow>
              ))}
              {AUDIT_LOG_STUB.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
