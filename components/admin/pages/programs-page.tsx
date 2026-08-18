"use client";

import { useMemo, useState } from "react";
import { BookOpen, Users, CheckCircle2, TrendingUp, X } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ADMIN_PROGRAMS, IMPLEMENTORS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const OWNERS = ["All implementors", ...IMPLEMENTORS.map((i) => i.name)];

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
          <div className="rounded-lg bg-primary/8 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgramsPage() {
  const [owner, setOwner] = useState("All implementors");

  const rows = useMemo(
    () => ADMIN_PROGRAMS.filter((p) => owner === "All implementors" || p.implementor === owner),
    [owner],
  );

  const active = ADMIN_PROGRAMS.filter((p) => p.status === "active").length;
  const cohorts = ADMIN_PROGRAMS.reduce((s, p) => s + p.cohorts, 0);
  const enrolled = ADMIN_PROGRAMS.reduce((s, p) => s + p.enrolled, 0);
  const avgCompletion = Math.round(
    ADMIN_PROGRAMS.reduce((s, p) => s + p.completion, 0) / ADMIN_PROGRAMS.length,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="All immunisation programs and cohorts running across implementors."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Programs" value={String(ADMIN_PROGRAMS.length)} sub={`${active} active · ${ADMIN_PROGRAMS.length - active} closed`} icon={BookOpen} />
        <Stat label="Cohorts" value={String(cohorts)} sub="Across all programs" icon={Users} />
        <Stat label="Children enrolled" value={enrolled.toLocaleString()} sub="Cumulative" icon={CheckCircle2} />
        <Stat label="Avg completion" value={`${avgCompletion}%`} sub="Schedule completion" icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Program register</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rows.length === ADMIN_PROGRAMS.length
                  ? `${ADMIN_PROGRAMS.length} programs`
                  : `${rows.length} of ${ADMIN_PROGRAMS.length} programs`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="h-9 w-full sm:w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              {owner !== "All implementors" && (
                <Button variant="ghost" size="sm" onClick={() => setOwner("All implementors")} className="text-muted-foreground shrink-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-64">Program</TableHead>
                  <TableHead className="w-48">Implementor</TableHead>
                  <TableHead className="text-right w-24">Cohorts</TableHead>
                  <TableHead className="text-right w-28">Enrolled</TableHead>
                  <TableHead className="w-52">Completion</TableHead>
                  <TableHead className="w-24 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-6 font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.implementor}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.cohorts}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.enrolled.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={p.completion}
                          className={cn(
                            "h-1.5 flex-1",
                            p.completion >= 80 ? "[&>div]:bg-emerald-500" :
                            p.completion >= 60 ? "[&>div]:bg-amber-500" : "[&>div]:bg-destructive",
                          )}
                        />
                        <span className="text-xs tabular-nums text-muted-foreground w-9 text-right shrink-0">
                          {p.completion}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                        p.status === "active"
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                          : "bg-muted text-muted-foreground border-border",
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          p.status === "active" ? "bg-emerald-500" : "bg-muted-foreground",
                        )} />
                        {p.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      No programs for this implementor.
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
