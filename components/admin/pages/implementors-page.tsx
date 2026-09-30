"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Building2, Users, Syringe, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/getvaxxed/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ImplementorListItem } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  active:     "bg-emerald-500/12 text-emerald-700 border-emerald-200",
  onboarding: "bg-amber-500/12 text-amber-700 border-amber-200",
  suspended:  "bg-destructive/10 text-destructive border-destructive/20",
};

function StatusDot({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
      STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border",
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        status === "active" ? "bg-emerald-500" :
        status === "onboarding" ? "bg-amber-500" : "bg-destructive",
      )} />
      {status}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: typeof Users; label: string; value: string; sub: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={cn("rounded-lg bg-primary/8 p-2", color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function patchStatus(id: string, status: string) {
  const res = await fetch(`/api/proxy/admin/implementors/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
}

export function ImplementorsPage({
  implementors: initial,
}: {
  implementors: ImplementorListItem[];
}) {
  const [implementors, setImplementors] = useState(initial);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All regions");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<ImplementorListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const regions = useMemo(
    () => ["All regions", ...Array.from(new Set(implementors.map((i) => i.region)))],
    [implementors],
  );

  const rows = useMemo(
    () =>
      implementors.filter(
        (i) =>
          (region === "All regions" || i.region === region) &&
          (status === "All statuses" || i.status === status) &&
          (i.name.toLowerCase().includes(q.toLowerCase()) ||
            i.lead.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, region, status, implementors],
  );

  const totalFacilities = implementors.reduce((s, i) => s + i.facilities_count, 0);
  const totalChildren = implementors.reduce((s, i) => s + i.children_enrolled, 0);
  const avgCoverage = implementors.length
    ? Math.round(implementors.reduce((s, i) => s + i.coverage_pct, 0) / implementors.length)
    : 0;
  const openAlerts = implementors.reduce((s, i) => s + i.open_se_alerts, 0);
  const hasFilters = q !== "" || region !== "All regions" || status !== "All statuses";

  const handleStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await patchStatus(id, newStatus);
        setImplementors((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: newStatus as ImplementorListItem["status"] } : i,
          ),
        );
        toast.success("Status updated");
      } catch {
        toast.error("Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Implementors"
        description="Organisations running immunization programs on GetVaxxed."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Building2} label="Total implementors" value={String(implementors.length)} sub={`${implementors.filter((i) => i.status === "active").length} active`} />
        <KpiCard icon={Users} label="Total facilities" value={String(totalFacilities)} sub="Across all regions" />
        <KpiCard icon={Syringe} label="Avg coverage" value={`${avgCoverage}%`} sub="Target 90%" />
        <KpiCard icon={AlertTriangle} label="Open AEFI alerts" value={String(openAlerts)} sub="Needs attention" color="text-destructive" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Implementor directory</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rows.length === implementors.length
                  ? `${implementors.length} implementors`
                  : `${rows.length} of ${implementors.length} implementors`}
              </p>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setQ(""); setRegion("All regions"); setStatus("All statuses"); }} className="text-muted-foreground hover:text-foreground self-start sm:self-auto">
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search implementor or lead…" className="pl-9 h-9" />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All statuses", "active", "onboarding", "suspended"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-56">Implementor</TableHead>
                  <TableHead className="w-36">Region</TableHead>
                  <TableHead className="text-right w-24">Facilities</TableHead>
                  <TableHead className="text-right w-24">Programs</TableHead>
                  <TableHead className="text-right w-28">Children</TableHead>
                  <TableHead className="w-36">Coverage</TableHead>
                  <TableHead className="w-36">Adherence</TableHead>
                  <TableHead className="text-right w-20">AEFI</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-16 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="pl-6">
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.lead.name}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{i.region}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.facilities_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.programs_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.children_enrolled.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={i.coverage_pct} className="h-1.5 flex-1" />
                        <span className="text-xs tabular-nums text-muted-foreground w-9 text-right shrink-0">{i.coverage_pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={i.adherence_pct} className="h-1.5 flex-1" />
                        <span className="text-xs tabular-nums text-muted-foreground w-9 text-right shrink-0">{i.adherence_pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {i.open_se_alerts > 0 ? (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold px-1.5">{i.open_se_alerts}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell><StatusDot status={i.status} /></TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(i)} className="h-7 px-3 text-xs">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No implementors match these filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.name}
              {selected && <StatusDot status={selected.status} />}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Lead · <span className="font-medium text-foreground">{selected.lead.name}</span>
                &nbsp;·&nbsp;{selected.region}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  ["Facilities", selected.facilities_count],
                  ["Programs", selected.programs_count],
                  ["Children enrolled", selected.children_enrolled.toLocaleString()],
                  ["Open AEFI alerts", selected.open_se_alerts],
                ] as [string, string | number][]).map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-1">
                {[
                  { label: "Coverage", value: selected.coverage_pct },
                  { label: "Adherence", value: selected.adherence_pct },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold tabular-nums">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Target 90%{value >= 90 ? " · ✓ On target" : ` · ${(90 - value).toFixed(1)} pts below target`}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                {selected.status !== "active" && (
                  <Button size="sm" onClick={() => { handleStatusChange(selected.id, "active"); setSelected((p) => p ? { ...p, status: "active" } : p); }} disabled={isPending}>
                    Activate
                  </Button>
                )}
                {selected.status !== "suspended" && (
                  <Button size="sm" variant="destructive" onClick={() => { handleStatusChange(selected.id, "suspended"); setSelected((p) => p ? { ...p, status: "suspended" } : p); }} disabled={isPending}>
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
