"use client";

import { useState } from "react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Building2, Users, Syringe, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IMPLEMENTORS, NATIONAL_TREND, USER_SEGMENTS, TOTAL_PLATFORM_USERS, ENROLMENT_GENDER,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

function Kpi({ icon: Icon, label, value, sub }: {
  icon: typeof Users; label: string; value: string; sub: string;
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

function TotalUsersCard() {
  const [segment, setSegment] = useState<"all" | (typeof USER_SEGMENTS)[number]["key"]>("all");
  const selected = USER_SEGMENTS.find((s) => s.key === segment);
  const total = selected ? selected.total : TOTAL_PLATFORM_USERS;
  const active = selected ? selected.active : USER_SEGMENTS.reduce((s, u) => s + u.active, 0);

  const chips: { key: typeof segment; label: string }[] = [
    { key: "all", label: "All" },
    ...USER_SEGMENTS.map((s) => ({ key: s.key as typeof segment, label: s.label })),
  ];

  return (
    <Card className="sm:col-span-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total users · all portals</span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{total.toLocaleString()}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {active.toLocaleString()} active
          {selected ? ` · +${selected.newThisMonth} new this month` : " across every portal"}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setSegment(c.key)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                segment === c.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ChildrenEnrolledCard({ total }: { total: number }) {
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const male = Math.round(total * ENROLMENT_GENDER.maleShare);
  const female = total - male;
  const value = gender === "male" ? male : gender === "female" ? female : total;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children enrolled</span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{value.toLocaleString()}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {male.toLocaleString()} male · {female.toLocaleString()} female
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors capitalize",
                gender === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewPage() {
  const facilities = IMPLEMENTORS.reduce((s, i) => s + i.facilities, 0);
  const patients = IMPLEMENTORS.reduce((s, i) => s + i.patients, 0);
  const coverage = Math.round(IMPLEMENTORS.reduce((s, i) => s + i.coverage, 0) / IMPLEMENTORS.length);
  const openAlerts = IMPLEMENTORS.reduce((s, i) => s + i.openAlerts, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="National overview" description="Rollup across the platform." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TotalUsersCard />
        <Kpi icon={Building2} label="Facilities" value={String(facilities)} sub="Across 6 regions" />
        <ChildrenEnrolledCard total={patients} />
        <Kpi icon={Syringe} label="National coverage" value={`${coverage}%`} sub="Target 90%" />
        <Kpi icon={AlertTriangle} label="Open SE alerts" value={String(openAlerts)} sub="Cross-implementor" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">National coverage & adherence trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={NATIONAL_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip wrapperStyle={{ zIndex: 50 }} />
              <Area type="monotone" dataKey="coverage" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} name="Coverage" />
              <Area type="monotone" dataKey="adherence" stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={0.1} name="Adherence" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
