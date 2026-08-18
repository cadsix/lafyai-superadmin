"use client";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { NATIONAL_ANTIGENS, NATIONAL_LOCATIONS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

function CoverageBar({ value, target = 90 }: { value: number; target?: number }) {
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
      {/* Target marker */}
      <div
        className="absolute top-[-3px] h-[14px] w-px bg-foreground/40 rounded-full"
        style={{ left: `${target}%` }}
        title={`Target: ${target}%`}
      />
    </div>
  );
}

function statusOf(value: number, target = 90) {
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

export function CoveragePage() {
  const avgAntigen = Math.round(NATIONAL_ANTIGENS.reduce((s, a) => s + a.coverage, 0) / NATIONAL_ANTIGENS.length);
  const avgLocation = Math.round(NATIONAL_LOCATIONS.reduce((s, l) => s + l.completion, 0) / NATIONAL_LOCATIONS.length);
  const onTarget = NATIONAL_ANTIGENS.filter((a) => a.coverage >= a.target).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="National coverage"
        description="Immunisation coverage against the 90% target, by antigen and by region."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Avg antigen coverage" value={`${avgAntigen}%`} sub="Across 7 antigens" />
        <StatCard label="Avg regional completion" value={`${avgLocation}%`} sub="6 regions reporting" />
        <StatCard
          label="Antigens on target"
          value={`${onTarget}/${NATIONAL_ANTIGENS.length}`}
          sub="≥ 90% coverage"
        />
      </div>

      <Tabs defaultValue="antigen">
        <TabsList>
          <TabsTrigger value="antigen">By antigen</TabsTrigger>
          <TabsTrigger value="location">By location</TabsTrigger>
        </TabsList>

        <TabsContent value="antigen">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">National antigen coverage</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vertical bar shows the 90% target
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
                      <TableHead className="w-28 pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {NATIONAL_ANTIGENS.map((a) => {
                      const s = statusOf(a.coverage, a.target);
                      return (
                        <TableRow key={a.antigen}>
                          <TableCell className="pl-6 font-medium">{a.antigen}</TableCell>
                          <TableCell className="pr-8">
                            <CoverageBar value={a.coverage} target={a.target} />
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "tabular-nums font-semibold text-sm",
                              a.coverage >= a.target ? "text-emerald-600" :
                              a.coverage >= a.target - 15 ? "text-amber-600" : "text-destructive",
                            )}>
                              {a.coverage}%
                            </span>
                          </TableCell>
                          <TableCell className="pr-6">
                            <span className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                              s.cls,
                            )}>
                              {s.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regional completion</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6 w-44">Location</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead className="text-right w-24">Rate</TableHead>
                      <TableHead className="text-right w-28">Facilities</TableHead>
                      <TableHead className="text-right w-28">Implementors</TableHead>
                      <TableHead className="w-28 pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {NATIONAL_LOCATIONS.map((l) => {
                      const s = statusOf(l.completion);
                      return (
                        <TableRow key={l.location}>
                          <TableCell className="pl-6 font-medium">{l.location}</TableCell>
                          <TableCell className="pr-8">
                            <CoverageBar value={l.completion} />
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "tabular-nums font-semibold text-sm",
                              l.completion >= 90 ? "text-emerald-600" :
                              l.completion >= 75 ? "text-amber-600" : "text-destructive",
                            )}>
                              {l.completion}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{l.facilities}</TableCell>
                          <TableCell className="text-right tabular-nums">{l.implementors}</TableCell>
                          <TableCell className="pr-6">
                            <span className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                              s.cls,
                            )}>
                              {s.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
