"use client";

import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Lightbulb, Users, MessageSquare, TrendingUp, ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CHANNEL_MIX, ENGAGEMENT_TREND, IMPLEMENTORS, NATIONAL_ANTIGENS,
  PLATFORM_INSIGHTS, TOTAL_PLATFORM_USERS, USER_SEGMENTS,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const IMPACT_STYLES = {
  high:   "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-700 border-amber-200",
  low:    "bg-muted text-muted-foreground border-border",
};

function Stat({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string; sub: string; icon: typeof Users; trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className="rounded-lg bg-primary/8 p-2 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightsPage() {
  const latest = ENGAGEMENT_TREND[ENGAGEMENT_TREND.length - 1];
  const first = ENGAGEMENT_TREND[0];
  const activeGrowth = Math.round(((latest.activeUsers - first.activeUsers) / first.activeUsers) * 100);
  const avgAdherence = Math.round(
    IMPLEMENTORS.reduce((s, i) => s + i.adherence, 0) / IMPLEMENTORS.length,
  );
  const laggards = [...NATIONAL_ANTIGENS].sort((a, b) => a.coverage - b.coverage).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Where the platform is winning, where it's stuck, and what to act on next."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Monthly active users"
          value={latest.activeUsers.toLocaleString()}
          sub={`Since ${first.month}`}
          icon={Users}
          trend={`+${activeGrowth}% growth`}
        />
        <Stat
          label="Confirmation rate"
          value={`${latest.confirmations}%`}
          sub="Reminder → confirmed visit"
          icon={MessageSquare}
        />
        <Stat
          label="Avg adherence"
          value={`${avgAdherence}%`}
          sub={`${TOTAL_PLATFORM_USERS.toLocaleString()} users on platform`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Engagement trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Line yAxisId="left" type="monotone" dataKey="activeUsers" name="Active users" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="confirmations" name="Confirmation %" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Users by portal</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {USER_SEGMENTS.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.label}</span>
                  <span className="tabular-nums font-semibold">{s.total.toLocaleString()}</span>
                </div>
                <Progress value={Math.round((s.total / TOTAL_PLATFORM_USERS) * 100)} className="h-1.5" />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{s.active.toLocaleString()} active</span>
                  <span className="text-emerald-600 font-medium">+{s.newThisMonth} this month</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Channel performance</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNEL_MIX} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip wrapperStyle={{ zIndex: 50 }} formatter={(v: number) => [`${v}%`]} />
                <Bar dataKey="share" name="Share of reminders" fill="var(--primary)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="confirmations" name="Confirmation rate" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} fillOpacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Biggest coverage gaps</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {laggards.map((a) => (
              <div key={a.antigen}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{a.antigen}</span>
                  <span className="tabular-nums text-destructive font-semibold text-xs">
                    {a.target - a.coverage} pts below target
                  </span>
                </div>
                <Progress value={a.coverage} className="h-1.5 [&>div]:bg-destructive" />
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {a.coverage}% coverage · target {a.target}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Recommended actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {PLATFORM_INSIGHTS.map((i) => (
            <div key={i.title} className="rounded-lg border bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold leading-snug">{i.title}</span>
                <span className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize shrink-0 mt-0.5",
                  IMPACT_STYLES[i.impact] ?? IMPACT_STYLES.low,
                )}>
                  {i.impact}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{i.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
