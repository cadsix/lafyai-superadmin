import { PageHeader } from "@/components/getvaxxed/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AuditLogGroup } from "@/lib/types";

// Colour-code the action string by keyword
function actionStyle(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("suspend") || a.includes("delete") || a.includes("remov"))
    return "bg-destructive/10 text-destructive border-destructive/20";
  if (a.includes("creat") || a.includes("add") || a.includes("onboard") || a.includes("register"))
    return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
  if (a.includes("updat") || a.includes("edit") || a.includes("patch") || a.includes("resolv"))
    return "bg-primary/10 text-primary border-primary/20";
  if (a.includes("login") || a.includes("logout") || a.includes("auth"))
    return "bg-amber-500/10 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}

function formatTimestamp(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

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
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{group.date_group}</CardTitle>
                <span className="text-xs text-muted-foreground">{group.items.length} entries</span>
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-0 pb-0">
              <div className="divide-y divide-border">
                {group.items.map((row) => (
                  <div key={row.id} className="flex flex-col gap-1.5 px-6 py-3 hover:bg-muted/30 transition-colors sm:flex-row sm:items-start sm:gap-4">
                    {/* Timestamp */}
                    <div className="shrink-0 text-xs text-muted-foreground w-32 pt-0.5">
                      {formatTimestamp(row.timestamp)}
                    </div>

                    {/* Action + target */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                        actionStyle(row.action),
                      )}>
                        {row.action}
                      </span>
                      {row.target_record && (
                        <p className="text-xs text-muted-foreground truncate">
                          {row.target_record}
                        </p>
                      )}
                    </div>

                    {/* Actor */}
                    <div className="shrink-0 text-right sm:text-right">
                      <div className="text-sm font-medium">{row.user_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {row.user_role.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {totalItems > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {totalItems} entries · {groups.length} date group{groups.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
