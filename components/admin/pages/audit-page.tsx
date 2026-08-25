import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AuditLogGroup } from "@/lib/types";

const ACTION_COLOR: Record<string, string> = {
  user_suspended:          "bg-destructive/10 text-destructive border-destructive/20",
  billing_account_created: "bg-primary/10 text-primary border-primary/20",
  facility_added:          "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  patient_registered:      "bg-primary/10 text-primary border-primary/20",
  dose_administered:       "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  alert_resolved:          "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

export function AuditPage({ groups }: { groups: AuditLogGroup[] }) {
  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="A tamper-evident record of all administrative actions across the platform."
      />

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No audit log entries yet.
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.date_group}>
            <CardHeader>
              <CardTitle className="text-base">{group.date_group}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{group.items.length} entries</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6 w-44">When</TableHead>
                      <TableHead className="w-56">Action</TableHead>
                      <TableHead className="w-48">Actor</TableHead>
                      <TableHead className="w-40">Role</TableHead>
                      <TableHead className="pr-6">Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="pl-6 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(row.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            ACTION_COLOR[row.action] ?? "bg-muted text-muted-foreground border-border",
                          )}>
                            {row.action.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{row.user_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground capitalize">
                          {row.user_role.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="pr-6 text-sm text-muted-foreground">
                          {row.target_record ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {totalItems > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {totalItems} entries across {groups.length} date group{groups.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
