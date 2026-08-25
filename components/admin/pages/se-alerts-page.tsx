"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Shield, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AEFIAlert } from "@/lib/types";

type AEFISummary = {
  critical_open: { value: number; sub_label: string | null; most_reported: string | null };
  moderate_open: { value: number; sub_label: string | null; most_reported: string | null };
  mild_open:     { value: number; sub_label: string | null; most_reported: string | null };
};

const SEVERITY_STYLES = {
  critical: {
    card:  "border-destructive/40 bg-destructive/5",
    icon:  "text-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    dot:   "bg-destructive",
  },
  moderate: {
    card:  "border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/10",
    icon:  "text-amber-500",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200",
    dot:   "bg-amber-500",
  },
  mild: {
    card:  "",
    icon:  "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    dot:   "bg-muted-foreground",
  },
};
const STATUS_STYLES: Record<string, string> = {
  open:     "bg-amber-500/10 text-amber-700 border-amber-200",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

async function resolveAlert(id: string, note: string): Promise<AEFIAlert> {
  const res = await fetch(`/api/proxy/aefi-alerts/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolution_note: note }),
  });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

export function SeAlertsPage({
  alerts: initial,
  summary,
}: {
  alerts: AEFIAlert[];
  summary: AEFISummary | null;
}) {
  const [alerts, setAlerts] = useState(initial);
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [facilityFilter, setFacilityFilter] = useState("All facilities");

  // Resolve dialog state
  const [resolving, setResolving] = useState<AEFIAlert | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const facilities = useMemo(
    () => ["All facilities", ...Array.from(new Set(alerts.map((a) => a.facility_name)))],
    [alerts],
  );

  const rows = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (severityFilter === "All severities" || a.severity === severityFilter) &&
          (facilityFilter === "All facilities" || a.facility_name === facilityFilter),
      ),
    [alerts, severityFilter, facilityFilter],
  );

  const counts = {
    critical: summary?.critical_open.value ?? alerts.filter((a) => a.severity === "critical").length,
    moderate: summary?.moderate_open.value ?? alerts.filter((a) => a.severity === "moderate").length,
    mild:     summary?.mild_open.value     ?? alerts.filter((a) => a.severity === "mild").length,
  };

  const hasFilters = severityFilter !== "All severities" || facilityFilter !== "All facilities";

  const handleResolve = () => {
    if (!resolving) return;
    if (!note.trim()) { toast.error("Please enter a resolution note"); return; }
    startTransition(async () => {
      try {
        const updated = await resolveAlert(resolving.id, note.trim());
        setAlerts((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        setResolving(null);
        setNote("");
        toast.success("Alert resolved");
      } catch {
        toast.error("Failed to resolve alert");
      }
    });
  };

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
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Critical open</span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums text-destructive">{counts.critical}</div>
            <div className="mt-1 text-xs text-muted-foreground">{summary?.critical_open.sub_label ?? "Requires immediate action"}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-300/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Moderate open</span>
              <Shield className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{counts.moderate}</div>
            <div className="mt-1 text-xs text-muted-foreground">{summary?.moderate_open.most_reported ?? "Awaiting resolution"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mild open</span>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{counts.mild}</div>
            <div className="mt-1 text-xs text-muted-foreground">{summary?.mild_open.most_reported ?? "Monitor & follow up"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="sm:w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All severities", "critical", "moderate", "mild"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={facilityFilter} onValueChange={setFacilityFilter}>
          <SelectTrigger className="sm:w-64 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {facilities.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSeverityFilter("All severities"); setFacilityFilter("All facilities"); }} className="text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground sm:ml-auto">
          {rows.length} of {alerts.length} events
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
                      <span className="font-semibold">{a.patient_name}</span>
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{a.id}</span>
                    </div>
                    {a.symptoms?.length > 0 && (
                      <p className="mt-1 text-sm text-muted-foreground">{a.symptoms.join(", ")}</p>
                    )}
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">{a.facility_name}</span>
                      {" · "}{a.vaccine_name}{" · "}Dose {a.dose_number}
                      {" · "}{new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", sty.badge)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", sty.dot)} />
                    {a.severity}
                  </span>
                  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                    STATUS_STYLES[a.status] ?? "bg-muted text-muted-foreground border-border",
                  )}>
                    {a.status}
                  </span>
                  {a.status === "open" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setResolving(a); setNote(""); }}>
                      Resolve
                    </Button>
                  )}
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

      {/* Resolve dialog */}
      <Dialog open={!!resolving} onOpenChange={(o) => { if (!o) setResolving(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve alert — {resolving?.patient_name}</DialogTitle>
            <DialogDescription>
              Add a resolution note. The patient sequence will resume once resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="resolve-note">Resolution note</Label>
            <Input
              id="resolve-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Patient treated, fever subsided within 24h"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolving(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={isPending || !note.trim()}>
              {isPending ? "Resolving…" : "Mark resolved"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
