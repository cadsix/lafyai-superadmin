import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AUDIT_LOG_STUB } from "@/lib/admin-data";

const ACTION_COLOR: Record<string, string> = {
  user_suspended:       "bg-destructive/10 text-destructive border-destructive/20",
  billing_account_created: "bg-primary/10 text-primary border-primary/20",
  facility_added:       "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

export function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="A tamper-evident record of all administrative actions across the platform."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{AUDIT_LOG_STUB.length} entries</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-44">When</TableHead>
                  <TableHead className="w-52">Action</TableHead>
                  <TableHead className="w-52">Actor</TableHead>
                  <TableHead className="w-48">Target</TableHead>
                  <TableHead className="pr-6">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {AUDIT_LOG_STUB.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-6 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={[
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        ACTION_COLOR[row.action] ?? "bg-muted text-muted-foreground border-border",
                      ].join(" ")}>
                        {row.action.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{row.actor_email || "system"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.target || "—"}</TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">{row.detail || "—"}</TableCell>
                  </TableRow>
                ))}
                {AUDIT_LOG_STUB.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      No activity recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
