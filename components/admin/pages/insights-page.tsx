"use client";

import { Lightbulb, Users, MessageSquare, TrendingUp, ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InsightsResponse } from "@/lib/types";

const IMPACT_STYLES: Record<string, string> = {
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
          <div className="rounded-lg bg-primary/8 p-2 text-primary shrink-0"><Icon className="h-5 w-5" /></div>
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

export function InsightsPage({ data }: { data: InsightsResponse | null }) {
  const d = data ?? {
    headline_metrics: {
      mau: { value: 0, change_pct: 0, since: "" },
      confirmation_rate: { value_pct: 0, label: "" },
      avg_adherence: { value_pct: 0, total_users: 0 },
    },
    portal_engagement: [],
    coverage_gaps: [],
    recommended_actions: [],
  };

  const totalPortalUsers = d.portal_engagement.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Where the platform is winning, where it's stuck, and what to act on next."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Monthly active users"
          value={d.headline_metrics.mau.value.toLocaleString()}
          sub={d.headline_metrics.mau.since ? `Since ${d.headline_metrics.mau.since}` : "Platform-wide"}
          icon={Users}
          trend={d.headline_metrics.mau.change_pct !== 0 ? `+${d.headline_metrics.mau.change_pct.toFixed(1)}% growth` : undefined}
        />
        <Stat
          label="Confirmation rate"
          value={`${d.headline_metrics.confirmation_rate.value_pct.toFixed(1)}%`}
          sub={d.headline_metrics.confirmation_rate.label || "Reminder → confirmed visit"}
          icon={MessageSquare}
        />
        <Stat
          label="Avg adherence"
          value={`${d.headline_metrics.avg_adherence.value_pct.toFixed(1)}%`}
          sub={`${d.headline_metrics.avg_adherence.total_users.toLocaleString()} users on platform`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {d.portal_engagement.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Users by portal</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {d.portal_engagement.map((s) => (
                <div key={s.portal}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium capitalize">{s.portal}</span>
                    <span className="tabular-nums font-semibold">{s.total.toLocaleString()}</span>
                  </div>
                  <Progress value={totalPortalUsers ? Math.round((s.total / totalPortalUsers) * 100) : 0} className="h-1.5" />
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{s.active.toLocaleString()} active</span>
                    <span className="text-emerald-600 font-medium">+{s.new_this_month} this month</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {d.coverage_gaps.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Biggest coverage gaps</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {d.coverage_gaps.slice(0, 5).map((a) => (
                <div key={a.antigen}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{a.antigen}</span>
                    <span className="tabular-nums text-destructive font-semibold text-xs">
                      {a.gap_pts.toFixed(1)} pts below target
                    </span>
                  </div>
                  <Progress value={a.coverage_pct} className="h-1.5 [&>div]:bg-destructive" />
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {a.coverage_pct.toFixed(1)}% coverage · target {a.target_pct}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {d.recommended_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Recommended actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {d.recommended_actions.map((action) => (
              <div key={action.id} className="rounded-lg border bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold leading-snug">{action.title}</span>
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize shrink-0 mt-0.5",
                    IMPACT_STYLES[action.impact] ?? IMPACT_STYLES.low,
                  )}>
                    {action.impact}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{action.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!data && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Insights data unavailable — check your connection or try again.
        </div>
      )}
    </div>
  );
}
