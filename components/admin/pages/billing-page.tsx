"use client";

import { useState, useTransition } from "react";
import {
  AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CreditCard, Plus, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { BillingMetrics, BillingPlanItem, BillingAccountItem } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  Trial:     "bg-amber-500/10 text-amber-700 border-amber-200",
  "Past due":"bg-destructive/10 text-destructive border-destructive/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};
const PLAN_STYLES: Record<string, string> = {
  Starter:  "bg-muted text-muted-foreground border-border",
  Growth:   "bg-primary/10 text-primary border-primary/20",
  National: "bg-violet-500/10 text-violet-700 border-violet-200",
};

function Stat({ label, value, sub, icon: Icon, highlight }: {
  label: string; value: string; sub: string; icon: typeof Wallet; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-destructive/40 bg-destructive/5" : undefined}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={cn("mt-1.5 text-3xl font-bold tabular-nums", highlight && "text-destructive")}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={cn("rounded-lg p-2", highlight ? "bg-destructive/10 text-destructive" : "bg-primary/8 text-primary")}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function createBillingAccount(body: {
  subscriber_type: string; subscriber_name: string; account_name?: string;
  plan: string; billing_cycle: string; seats: number; facilities?: number;
}): Promise<BillingAccountItem> {
  const res = await fetch(`/api/proxy/admin/billing/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to create billing account");
  }
  return res.json();
}

export function BillingPage({
  metrics,
  plans,
  accounts: initialAccounts,
}: {
  metrics: BillingMetrics | null;
  plans: BillingPlanItem[];
  accounts: BillingAccountItem[];
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    subscriberType: "implementor",
    subscriberName: "",
    accountName: "",
    plan: "Growth",
    cycle: "Monthly",
    seats: "20",
    facilities: "5",
  });

  const m = metrics ?? { mrr_usd: 0, total_accounts: 0, active_accounts: 0, licensed_seats: 0, past_due_accounts: 0 };

  const handleCreate = () => {
    if (!form.subscriberName.trim()) { toast.error("Subscriber name is required"); return; }
    startTransition(async () => {
      try {
        const created = await createBillingAccount({
          subscriber_type: form.subscriberType,
          subscriber_name: form.subscriberName.trim(),
          account_name: form.accountName.trim() || undefined,
          plan: form.plan,
          billing_cycle: form.cycle,
          seats: Number(form.seats) || 10,
          facilities: form.subscriberType === "implementor" ? Number(form.facilities) || 1 : undefined,
        });
        setAccounts((prev) => [created, ...prev]);
        setOpen(false);
        setForm({ subscriberType: "implementor", subscriberName: "", accountName: "", plan: "Growth", cycle: "Monthly", seats: "20", facilities: "5" });
        toast.success("Billing account created");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create account");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & subscription"
        description="Subscription plans, billing accounts and invoice status across the platform."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> New billing account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New billing account</DialogTitle>
                <DialogDescription>Create a subscription for an implementor or facility.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscriber type</Label>
                  <Select value={form.subscriberType} onValueChange={(v) => setForm({ ...form, subscriberType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="implementor">Implementor</SelectItem>
                      <SelectItem value="facility">Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-name">Subscriber name</Label>
                  <Input id="sub-name" value={form.subscriberName} onChange={(e) => setForm({ ...form, subscriberName: e.target.value })} placeholder="e.g. Eastern Health Trust" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-name">Account name (optional)</Label>
                  <Input id="acc-name" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="Defaults to subscriber name" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {plans.map((p) => <SelectItem key={p.plan} value={p.plan}>{p.plan} — ${p.price_per_month}/mo</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing cycle</Label>
                    <Select value={form.cycle} onValueChange={(v) => setForm({ ...form, cycle: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bl-seats">Seats</Label>
                    <Input id="bl-seats" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
                  </div>
                  {form.subscriberType === "implementor" && (
                    <div className="space-y-2">
                      <Label htmlFor="bl-fac">Facilities</Label>
                      <Input id="bl-fac" type="number" value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isPending}>Create account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Monthly recurring revenue" value={`$${m.mrr_usd.toLocaleString()}`} sub="Active + trial accounts" icon={Wallet} />
        <Stat label="Accounts" value={String(m.total_accounts)} sub={`${m.active_accounts} active`} icon={CreditCard} />
        <Stat label="Licensed seats" value={String(m.licensed_seats)} sub="Across all plans" icon={TrendingUp} />
        <Stat label="Past due" value={String(m.past_due_accounts)} sub="Needs follow-up" icon={AlertCircle} highlight={m.past_due_accounts > 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Plans</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {plans.map((p) => (
                <div key={p.plan} className="rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", PLAN_STYLES[p.plan] ?? "bg-muted text-muted-foreground border-border")}>{p.plan}</span>
                    <span className="text-sm font-bold tabular-nums">${p.price_per_month}<span className="font-normal text-muted-foreground text-xs">/mo</span></span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{p.seats_included} seats included</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className={plans.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader><CardTitle className="text-base">Billing accounts</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 w-52">Account</TableHead>
                    <TableHead className="w-28">Plan</TableHead>
                    <TableHead className="text-right w-24">Facilities</TableHead>
                    <TableHead className="text-right w-20">Seats</TableHead>
                    <TableHead className="text-right w-28">Amount</TableHead>
                    <TableHead className="w-24">Cycle</TableHead>
                    <TableHead className="w-32">Next invoice</TableHead>
                    <TableHead className="w-28 pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="pl-6">
                        <div className="font-medium">{a.account_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{a.id}</div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", PLAN_STYLES[a.plan] ?? "bg-muted text-muted-foreground border-border")}>{a.plan}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{a.facilities_count}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.seats}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">${a.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.billing_cycle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.next_invoice ?? "—"}</TableCell>
                      <TableCell className="pr-6">
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                          STATUS_STYLES[a.status] ?? "bg-muted text-muted-foreground border-border",
                        )}>
                          {a.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No billing accounts yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
