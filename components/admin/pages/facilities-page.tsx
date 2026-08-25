"use client";

import { useMemo, useState, useTransition } from "react";
import { Building2, CheckCircle2, Users, Search, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { FacilityListItem } from "@/lib/types";

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  Starter:  { label: "Starter",  cls: "bg-muted text-muted-foreground border-border" },
  Growth:   { label: "Growth",   cls: "bg-primary/10 text-primary border-primary/20" },
  National: { label: "National", cls: "bg-violet-500/10 text-violet-700 border-violet-200" },
};

function Stat({ label, value, sub, icon: Icon }: {
  label: string; value: string; sub: string; icon: typeof Users;
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
          <div className="rounded-lg bg-primary/8 p-2 text-primary"><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

async function createFacility(body: {
  name: string; region: string; district?: string; type: string;
  implementor_id: string; plan: string; seats: number;
}): Promise<FacilityListItem> {
  const res = await fetch(`/api/proxy/admin/facilities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to create facility");
  }
  return res.json();
}

export function FacilitiesPage({ facilities: initial }: { facilities: FacilityListItem[] }) {
  const [facilities, setFacilities] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "", region: "", district: "", type: "Hospital",
    implementor_id: "", plan: "Starter", seats: "10",
  });
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("all");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");

  const regions = useMemo(() => Array.from(new Set(facilities.map((f) => f.region))), [facilities]);

  const rows = useMemo(
    () => facilities.filter((f) => {
      const matchQ = !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.implementor.toLowerCase().includes(q.toLowerCase());
      return matchQ &&
        (region === "all" || f.region === region) &&
        (plan === "all" || f.plan === plan) &&
        (status === "all" || f.status.toLowerCase() === status);
    }),
    [facilities, q, region, plan, status],
  );

  const active = facilities.filter((f) => f.status?.toLowerCase() === "active").length;
  const seats = facilities.reduce((s, f) => s + f.seats, 0);
  const hasFilters = q !== "" || region !== "all" || plan !== "all" || status !== "all";

  const handleAdd = () => {
    if (!form.name.trim() || !form.region.trim()) {
      toast.error("Facility name and region are required");
      return;
    }
    startTransition(async () => {
      try {
        const created = await createFacility({
          name: form.name.trim(),
          region: form.region.trim(),
          district: form.district.trim() || undefined,
          type: form.type,
          implementor_id: form.implementor_id.trim(),
          plan: form.plan,
          seats: Number(form.seats) || 10,
        });
        setFacilities((prev) => [created as unknown as FacilityListItem, ...prev]);
        setForm({ name: "", region: "", district: "", type: "Hospital", implementor_id: "", plan: "Starter", seats: "10" });
        setAddOpen(false);
        toast.success("Facility added");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to add facility");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        description="Every facility on the platform — plan, activation status, and renewal dates."
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> Add facility</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add facility</DialogTitle>
                <DialogDescription>Register a new facility and assign it to an implementor and plan.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fac-name">Facility name</Label>
                  <Input id="fac-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tamale West CHPS" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fac-region">Region</Label>
                    <Input id="fac-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Northern" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fac-district">District</Label>
                    <Input id="fac-district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Sagnarigu" />
                  </div>
                  <div className="space-y-2">
                    <Label>Facility type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Clinic", "Hospital", "Health System"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fac-impl">Implementor ID</Label>
                    <Input id="fac-impl" value={form.implementor_id} onChange={(e) => setForm({ ...form, implementor_id: e.target.value })} placeholder="e.g. impl-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Starter", "Growth", "National"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fac-seats">Seats</Label>
                    <Input id="fac-seats" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={isPending}>Add facility</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Facilities" value={String(facilities.length)} sub={`${regions.length} regions`} icon={Building2} />
        <Stat label="Active" value={String(active)} sub={`${facilities.length - active} inactive`} icon={CheckCircle2} />
        <Stat label="Licensed seats" value={String(seats)} sub="Across all plans" icon={Users} />
        <Stat label="Tracked" value={String(facilities.length)} sub="On platform" icon={Building2} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Facility directory</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rows.length === facilities.length ? `${facilities.length} facilities` : `${rows.length} of ${facilities.length} facilities`}
              </p>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setQ(""); setRegion("all"); setPlan("all"); setStatus("all"); }} className="text-muted-foreground self-start sm:self-auto">
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search facility or implementor" className="pl-9 h-9" />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9"><SelectValue placeholder="All regions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="h-9"><SelectValue placeholder="All plans" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {["Starter", "Growth", "National"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Any status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-60">Facility</TableHead>
                  <TableHead className="w-48">Region · District</TableHead>
                  <TableHead className="w-44">Implementor</TableHead>
                  <TableHead className="w-28">Plan</TableHead>
                  <TableHead className="text-right w-20">Seats</TableHead>
                  <TableHead className="text-right w-28">Completion</TableHead>
                  <TableHead className="w-28">Renews</TableHead>
                  <TableHead className="w-24 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((f) => {
                  const planStyle = PLAN_BADGE[f.plan] ?? PLAN_BADGE.Starter;
                  const isActive = f.status?.toLowerCase() === "active";
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="pl-6">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.type}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.region} · {f.district}</TableCell>
                      <TableCell className="text-sm">{f.implementor}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", planStyle.cls)}>{planStyle.label}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{f.seats}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn("tabular-nums font-medium text-sm",
                          f.completion_pct >= 90 ? "text-emerald-600" : f.completion_pct >= 75 ? "text-amber-600" : "text-destructive",
                        )}>
                          {f.completion_pct}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.renews_on ?? "—"}</TableCell>
                      <TableCell className="pr-6">
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border",
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-muted-foreground")} />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No facilities match these filters</p>
                      </div>
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
