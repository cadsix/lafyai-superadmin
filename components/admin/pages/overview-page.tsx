"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Building2, Users, Syringe, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OverviewSummary, OverviewTrendPoint } from "@/lib/types";

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <div className="mt-1.5 text-3xl font-bold tabular-nums">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
          </div>
          <div className="rounded-lg bg-primary/8 p-2 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalUsersCard({
  total,
  active,
  breakdown,
}: {
  total: number;
  active: number;
  breakdown: { implementors: number; health_workers: number; facilities: number };
}) {
  type Seg = "all" | "implementors" | "health_workers" | "facilities";
  const [segment, setSegment] = useState<Seg>("all");

  const chips: { key: Seg; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    { key: "implementors", label: "Implementors", count: breakdown.implementors },
    { key: "health_workers", label: "Health workers", count: breakdown.health_workers },
    { key: "facilities", label: "Facilities", count: breakdown.facilities },
  ];

  const selected = chips.find((c) => c.key === segment)!;

  return (
    <Card className="sm:col-span-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total users · all portals
          </span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">
          {selected.count.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {segment === "all"
            ? `${active.toLocaleString()} active across every portal`
            : `${selected.count.toLocaleString()} ${selected.label.toLowerCase()}`}
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

function ChildrenEnrolledCard({
  total,
  male,
  female,
}: {
  total: number;
  male: number;
  female: number;
}) {
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const value = gender === "male" ? male : gender === "female" ? female : total;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Children enrolled
          </span>
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

export function OverviewPage({
  summary,
  trends,
}: {
  summary: OverviewSummary | null;
  trends: OverviewTrendPoint[];
}) {
  // Fallback zeros if API is down
  const s = summary ?? {
    total_users: {
      total_count: 0,
      active_count: 0,
      breakdown: { implementors: 0, health_workers: 0, facilities: 0 },
    },
    facilities: { total_count: 0, regions_count: 0 },
    children_enrolled: { total_count: 0, male_count: 0, female_count: 0 },
    national_coverage: { current_pct: 0, target_pct: 90 },
    open_se_alerts: { total_open: 0, scope: "" },
  };

  const coverage = s.national_coverage.current_pct;
  const target = s.national_coverage.target_pct;

  // Normalise trend keys for recharts
  const chartData = trends.map((p) => ({
    month: p.month,
    coverage: p.coverage_pct,
    adherence: p.adherence_pct,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="National overview"
        description="Real-time rollup across the entire platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TotalUsersCard
          total={s.total_users.total_count}
          active={s.total_users.active_count}
          breakdown={s.total_users.breakdown}
        />
        <Kpi
          icon={Building2}
          label="Active facilities"
          value={String(s.facilities.total_count)}
          sub={`Across ${s.facilities.regions_count} regions`}
        />
        <ChildrenEnrolledCard
          total={s.children_enrolled.total_count}
          male={s.children_enrolled.male_count}
          female={s.children_enrolled.female_count}
        />
        <Kpi
          icon={Syringe}
          label="National coverage"
          value={`${coverage}%`}
          sub={
            coverage >= target
              ? "✓ On target"
              : `${(target - coverage).toFixed(1)} pts below target`
          }
        />
        <Kpi
          icon={AlertTriangle}
          label="Open AEFI alerts"
          value={String(s.open_se_alerts.total_open)}
          sub="Needs attention"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            National coverage &amp; adherence trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Area
                  type="monotone"
                  dataKey="coverage"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.18}
                  name="Coverage"
                />
                <Area
                  type="monotone"
                  dataKey="adherence"
                  stroke="var(--muted-foreground)"
                  fill="var(--muted-foreground)"
                  fillOpacity={0.1}
                  name="Adherence"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
