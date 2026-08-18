"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Shield, CheckCircle2, X } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CROSS_ALERTS, IMPLEMENTORS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const OWNERS = ["All implementors", ...IMPLEMENTORS.map((i) => i.name)];
const SEVERITIES = ["All severities", "critical", "moderate", "mild"];

const SEVERITY_STYLES = {
  critical: {
    card: "border-destructive/40 bg-destructive/5",
    icon: "text-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  moderate: {
    card: "border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/10",
    icon: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  mild: {
    card: "",
    icon: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

const STATUS_STYLES: Record<string, string> = {
  escalated: "bg-destructive/10 text-destructive border-destructive/20",
  open: "bg-amber-500/10 text-amber-700 border-amber-200",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

export function SeAlertsPage() {
  const [owner, setOwner] = useState("All implementors");
  const [severity, setSeverity] = useState("All severities");

  const rows = useMemo(
    () =>
      CROSS_ALERTS.filter(
        (a) =>
          (owner === "All implementors" || a.implementor === owner) &&
          (severity === "All severities" || a.severity === severity),
      ),
    [owner, severity],
  );

  const counts = {
    critical: CROSS_ALERTS.filter((a) => a.severity === "critical").length,
    open: CROSS_ALERTS.filter((a) => a.status !== "resolved").length,
    resolved: CROSS_ALERTS.filter((a) => a.status === "resolved").length,
  };

  const hasFilters = owner !== "All implementors" || severity !== "All severities";

  return (
    <div className="space-y-6">
      <PageHeader
        title="AEFI oversight"
        description="Every adverse event following immunisation (AEFI) reported across implementors."
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Critical</span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums text-destructive">{counts.critical}</div>
            <div className="mt-1 text-xs text-muted-foreground">Requires immediate action</div>
          </CardContent>
        </Card>
        <Card className="border-amber-300/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Open / escalated</span>
              <Shield className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{counts.open}</div>
            <div className="mt-1 text-xs text-muted-foreground">Awaiting resolution</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resolved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums text-emerald-600">{counts.resolved}</div>
            <div className="mt-1 text-xs text-muted-foreground">Closed this period</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="sm:w-64 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="sm:w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setOwner("All implementors"); setSeverity("All severities"); }}
            className="text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground sm:ml-auto">
          {rows.length} of {CROSS_ALERTS.length} events
        </span>
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {rows.map((a) => {
          const sty = SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.mild;
          return (
            <Card key={a.id} className={cn("transition-shadow hover:shadow-sm", sty.card)}>
              <CardContent className="p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className={cn("mt-0.5 shrink-0", sty.icon)}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{a.name}</span>
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {a.id}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">{a.implementor}</span>
                      {" · "}{a.facility}{" · "}{a.reportedAt}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                    sty.badge,
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", sty.dot)} />
                    {a.severity}
                  </span>
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                    STATUS_STYLES[a.status] ?? "bg-muted text-muted-foreground border-border",
                  )}>
                    {a.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">No AEFI events match these filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
