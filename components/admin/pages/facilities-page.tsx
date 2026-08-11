"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle2, PauseCircle, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ADMIN_FACILITIES, IMPLEMENTORS, type AdminFacility } from "@/lib/admin-data";

const PLAN_TONE: Record<string, string> = {
  Starter: "secondary",
  Growth: "default",
  National: "default",
};

function Stat({ label, value, sub, icon: Icon }: {
  label: string; value: string; sub: string; icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

export function FacilitiesPage() {
  const [facilities, setFacilities] = useState<AdminFacility[]>(ADMIN_FACILITIES);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", region: "", district: "",
    type: "CHPS" as AdminFacility["type"],
    implementor: IMPLEMENTORS[0]?.name ?? "",
    plan: "Starter" as AdminFacility["plan"],
    seats: "10",
  });
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("all");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");

  const regions = Array.from(new Set(facilities.map((f) => f.region)));

  const addFacility = () => {
    if (!form.name.trim() || !form.region.trim()) {
      toast.error("Facility name and region are required");
      return;
    }
    setFacilities((prev) => [
      {
        id: `fac-${1000 + prev.length + 1}`,
        name: form.name.trim(),
        region: form.region.trim(),
        district: form.district.trim() || form.region.trim(),
        type: form.type,
        implementor: form.implementor,
        plan: form.plan,
        seats: Number(form.seats) || 0,
        patients: 0,
        coverage: 0,
        active: true,
        renewsOn: "2027-08-05",
      },
      ...prev,
    ]);
    setForm({ ...form, name: "", district: "" });
    setAddOpen(false);
    toast.success("Facility added");
  };

  const rows = useMemo(
    () =>
      facilities.filter((f) => {
        const matchesQ = !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.implementor.toLowerCase().includes(q.toLowerCase());
        return (
          matchesQ &&
          (region === "all" || f.region === region) &&
          (plan === "all" || f.plan === plan) &&
          (status === "all" || (status === "active" ? f.active : !f.active))
        );
      }),
    [facilities, q, region, plan, status],
  );

  const active = facilities.filter((f) => f.active).length;
  const seats = facilities.reduce((s, f) => s + f.seats, 0);
  const patients = facilities.reduce((s, f) => s + f.patients, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        description="Every facility on the platform, its plan and activation status."
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Add facility</Button>
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
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AdminFacility["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teaching hospital">Teaching hospital</SelectItem>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Polyclinic">Polyclinic</SelectItem>
                        <SelectItem value="CHPS">CHPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Implementor</Label>
                    <Select value={form.implementor} onValueChange={(v) => setForm({ ...form, implementor: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {IMPLEMENTORS.map((i) => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v as AdminFacility["plan"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Starter">Starter</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="National">National</SelectItem>
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
                <Button onClick={addFacility}>Add facility</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Facilities" value={String(facilities.length)} sub={`${regions.length} regions`} icon={Building2} />
        <Stat label="Active" value={String(active)} sub={`${facilities.length - active} inactive`} icon={CheckCircle2} />
        <Stat label="Licensed seats" value={String(seats)} sub="Across all plans" icon={Users} />
        <Stat label="Children enrolled" value={patients.toLocaleString()} sub="Facility-level totals" icon={PauseCircle} />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-base">Facility directory</CardTitle>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search facility or implementor" className="pl-8" />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="National">National</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Region / district</TableHead>
                <TableHead>Implementor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Seats</TableHead>
                <TableHead className="text-right">Completion</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.type}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.region} · {f.district}</TableCell>
                  <TableCell>{f.implementor}</TableCell>
                  <TableCell>
                    <Badge variant={PLAN_TONE[f.plan] === "secondary" ? "secondary" : "default"}>{f.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{f.seats}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.coverage}%</TableCell>
                  <TableCell className="text-muted-foreground">{f.renewsOn}</TableCell>
                  <TableCell>
                    <Badge variant={f.active ? "secondary" : "outline"}>
                      {f.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No facilities match these filters.
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
