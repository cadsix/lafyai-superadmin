"use client";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CoverageSummary, CoverageAntigenItem } from "@/lib/types";

const TARGET = 90;

function CoverageBar({ value, target = TARGET }: { value: number; target?: number }) {
  const pct = Math.min(value, 100);
  return (
    <div className="relative h-2 w-full rounded-full bg-muted">
      <div
        className={cn(
          "h-2 rounded-full transition-all",
          value >= target ? "bg-emerald-500" :
          value >= target - 15 ? "bg-amber-500" : "bg-destructive",
        )}
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-[-3px] h-[14px] w-px bg-foreground/40 rounded-full"
        style={{ left: `${target}%` }}
        title={`Target: ${target}%`}
      />
    </div>
  );
}

function statusOf(value: number, target = TARGET) {
  if (value >= target)        return { label: "On target", cls: "bg-emerald-500/10 text-emerald-700 border-emerald-200" };
  if (value >= target - 15)  return { label: "Watch",     cls: "bg-amber-500/10 text-amber-700 border-amber-200" };
  return                              { label: "At risk",  cls: "bg-destructive/10 text-destructive border-destructive/20" };
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-3xl font-bold tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

export function CoveragePage({
  summary,
  antigens,
}: {
  summary: CoverageSummary | null;
  antigens: CoverageAntigenItem[];
}) {
  const target = summary?.target_pct ?? TARGET;
  const avgCoverage = summary?.avg_antigen_coverage_pct ?? (
    antigens.length
      ? Math.round(antigens.reduce((s, a) => s + a.coverage_pct, 0) / antigens.length)
      : 0
  );
  const onTarget = antigens.filter((a) => a.coverage_pct >= target).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="National coverage"
        description="Immunisation coverage against target, by antigen."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Avg antigen coverage"
          value={`${avgCoverage.toFixed(1)}%`}
          sub={`Across ${antigens.length} antigens tracked`}
        />
        <StatCard
          label="Avg vaccine completion"
          value={`${(summary?.avg_vaccine_completion_pct ?? 0).toFixed(1)}%`}
          sub={`${summary?.vaccines_tracked ?? antigens.length} vaccines tracked`}
        />
        <StatCard
          label="Antigens on target"
          value={`${onTarget}/${antigens.length}`}
          sub={`≥ ${target}% coverage`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Antigen coverage</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vertical bar shows the {target}% target
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-36">Antigen</TableHead>
                  <TableHead>Coverage vs target</TableHead>
                  <TableHead className="text-right w-28">Coverage</TableHead>
                  <TableHead className="w-32">Trend</TableHead>
                  <TableHead className="w-28 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {antigens.map((a, idx) => {
                  const s = statusOf(a.coverage_pct, target);
                  return (
                    <TableRow key={`${a.antigen}-${idx}`}>
                      <TableCell className="pl-6 font-medium">{a.antigen}</TableCell>
                      <TableCell className="pr-8">
                        <CoverageBar value={a.coverage_pct} target={target} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("tabular-nums font-semibold text-sm",
                          a.coverage_pct >= target ? "text-emerald-600" :
                          a.coverage_pct >= target - 15 ? "text-amber-600" : "text-destructive",
                        )}>
                          {a.coverage_pct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {a.trend_direction}
                        {a.dropout_trend_pct !== 0 && (
                          <span className={cn("ml-1 text-xs",
                            a.dropout_trend_pct > 0 ? "text-destructive" : "text-emerald-600",
                          )}>
                            {a.dropout_trend_pct > 0 ? "+" : ""}{a.dropout_trend_pct.toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", s.cls)}>
                          {s.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {antigens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      No coverage data available.
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
