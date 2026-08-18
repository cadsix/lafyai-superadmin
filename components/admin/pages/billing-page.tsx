"use client";

import { useMemo, useState } from "react";
import {
  AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CreditCard, Plus, TrendingUp, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  BILLING_ACCOUNTS, PLAN_CATALOGUE, REVENUE_TREND, ADMIN_FACILITIES, IMPLEMENTORS,
  type BillingAccount, type BillingPlan,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<BillingAccount["status"], string> = {
  active: "Active", trial: "Trial", past_due: "Past due", cancelled: "Cancelled",
};
const STATUS_STYLES: Record<BillingAccount["status"], string> = {
  active:    "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  trial:     "bg-amber-500/10 text-amber-700 border-amber-200",
  past_due:  "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
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

export function BillingPage() {
  const [accounts, setAccounts] = useState<BillingAccount[]>(BILLING_ACCOUNTS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subscriberType: "implementor" as "implementor" | "facility",
    subscriber: IMPLEMENTORS[0]?.name ?? "",
    account: "",
    plan: "Growth" as BillingPlan,
    cycle: "Monthly" as BillingAccount["cycle"],
    seats: "20",
    facilities: "5",
  });

  const mrr = useMemo(
    () => accounts
      .filter((a) => a.status === "active" || a.status === "trial")
      .reduce((s, a) => s + (a.cycle === "Annual" ? Math.round(a.amount / 12) : a.amount), 0),
    [accounts],
  );
  const pastDue = accounts.filter((a) => a.status === "past_due").length;
  const seats = accounts.reduce((s, a) => s + a.seats, 0);
  const activeCount = accounts.filter((a) => a.status === "active").length;

  const createAccount = () => {
    const name = form.account.trim() || form.subscriber;
    if (!name) { toast.error("Select or name the subscriber"); return; }
    const price = PLAN_CATALOGUE.find((p) => p.plan === form.plan)!.pricePerMonth;
    setAccounts((prev) => [
      {
        id: `acc-${1000 + prev.length + 1}`,
        account: name,
        implementor: form.subscriberType === "implementor" ? name : form.subscriber,
        plan: form.plan,
        facilities: form.subscriberType === "facility" ? 1 : Number(form.facilities) || 0,
        seats: Number(form.seats) || 0,
        amount: form.cycle === "Annual" ? price * 12 : price,
        cycle: form.cycle,
        status: "trial",
        nextInvoice: "2026-08-26",
      },
      ...prev,
    ]);
    setOpen(false);
    toast.success("Billing account created");
    setForm({
      subscriberType: "implementor",
      subscriber: IMPLEMENTORS[0]?.name ?? "",
      account: "",
      plan: "Growth",
      cycle: "Monthly",
      seats: "20",
      facilities: "5",
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
                <DialogDescription>Create a subscription and billing account for an implementor or facility.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscription for</Label>
                  <Select value={form.subscriberType} onValueChange={(v) => setForm({ ...form, subscriberType: v as "implementor" | "facility", subscriber: v === "implementor" ? (IMPLEMENTORS[0]?.name ?? "") : (ADMIN_FACILITIES[0]?.name ?? "") })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="implementor">Implementor</SelectItem>
                      <SelectItem value="facility">Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{form.subscriberType === "implementor" ? "Implementor" : "Facility"}</Label>
                  <Select value={form.subscriber} onValueChange={(v) => setForm({ ...form, subscriber: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {(form.subscriberType === "implementor"
                        ? IMPLEMENTORS.map((i) => i.name)
                        : ADMIN_FACILITIES.map((f) => f.name)
                      ).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account name (optional)</Label>
                  <Input id="account" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} placeholder={form.subscriber} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v as BillingPlan })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLAN_CATALOGUE.map((p) => (
                          <SelectItem key={p.plan} value={p.plan}>{p.plan} — ${p.pricePerMonth}/mo</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing cycle</Label>
                    <Select value={form.cycle} onValueChange={(v) => setForm({ ...form, cycle: v as BillingAccount["cycle"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seats">Seats</Label>
                    <Input id="seats" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
                  </div>
                  {form.subscriberType === "implementor" && (
                    <div className="space-y-2">
                      <Label htmlFor="facilities">Facilities</Label>
                      <Input id="facilities" type="number" value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createAccount}>Create account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Monthly recurring revenue" value={`$${mrr.toLocaleString()}`} sub="Active + trial accounts" icon={Wallet} />
        <Stat label="Accounts" value={String(accounts.length)} sub={`${activeCount} active`} icon={CreditCard} />
        <Stat label="Licensed seats" value={String(seats)} sub="Across all plans" icon={TrendingUp} />
        <Stat label="Past due" value={String(pastDue)} sub="Needs follow-up" icon={AlertCircle} highlight={pastDue > 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recurring revenue trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  wrapperStyle={{ zIndex: 50 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "MRR"]}
                />
                <Area type="monotone" dataKey="mrr" name="MRR" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Plans</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {PLAN_CATALOGUE.map((p) => (
              <div key={p.plan} className="rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    PLAN_STYLES[p.plan] ?? "bg-muted text-muted-foreground border-border",
                  )}>
                    {p.plan}
                  </span>
                  <span className="text-sm font-bold tabular-nums">${p.pricePerMonth}<span className="font-normal text-muted-foreground text-xs">/mo</span></span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{p.blurb}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{p.seatsIncluded} seats included</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
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
                      <div className="font-medium">{a.account}</div>
                      <div className="text-xs text-muted-foreground font-mono">{a.id}</div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        PLAN_STYLES[a.plan] ?? "bg-muted text-muted-foreground border-border",
                      )}>
                        {a.plan}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{a.facilities}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.seats}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">${a.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.cycle}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.nextInvoice}</TableCell>
                    <TableCell className="pr-6">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[a.status],
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full",
                          a.status === "active" ? "bg-emerald-500" :
                          a.status === "trial" ? "bg-amber-500" :
                          a.status === "past_due" ? "bg-destructive" : "bg-muted-foreground",
                        )} />
                        {STATUS_LABEL[a.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
