"use client";

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { MessageSquare, CheckCheck, XCircle, BellOff, Search, X } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  MESSAGE_DELIVERY, MESSAGE_LOG, MESSAGE_VOLUME_TREND,
} from "@/lib/message-data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

const STATUS_LABEL: Record<string, string> = {
  delivered: "Delivered", read: "Read", failed: "Failed",
  opted_out: "Opted out", queued: "Queued",
};
const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  read:      "bg-primary/10 text-primary border-primary/20",
  failed:    "bg-destructive/10 text-destructive border-destructive/20",
  opted_out: "bg-muted text-muted-foreground border-border",
  queued:    "bg-amber-500/10 text-amber-700 border-amber-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
      STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border",
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        status === "delivered" ? "bg-emerald-500" :
        status === "read" ? "bg-primary" :
        status === "failed" ? "bg-destructive" :
        status === "queued" ? "bg-amber-500" : "bg-muted-foreground",
      )} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function Stat({ label, value, hint, icon: Icon }: {
  label: string; value: string; hint: string; icon: typeof MessageSquare;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className="rounded-lg bg-primary/8 p-2 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MessagesPage() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All channels");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MESSAGE_LOG.filter(
      (m) =>
        (channel === "All channels" || m.channel === channel) &&
        (status === "All statuses" || m.status === status) &&
        (q === "" ||
          m.recipient.toLowerCase().includes(q) ||
          m.facility.toLowerCase().includes(q) ||
          m.template.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)),
    );
  }, [query, channel, status]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const totalSent = MESSAGE_VOLUME_TREND.reduce((s, w) => s + w.sent, 0);
  const failed = MESSAGE_LOG.filter((m) => m.status === "failed").length;
  const optedOut = MESSAGE_LOG.filter((m) => m.status === "opted_out").length;
  const facilities = useMemo(() => Array.from(new Set(MESSAGE_LOG.map((m) => m.facility))), []);

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };
  const hasFilters = query !== "" || channel !== "All channels" || status !== "All statuses";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Message log"
        description="Every reminder sent to caregivers, with delivery outcome by channel and facility."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Messages sent" value={totalSent.toLocaleString()} hint="Last 4 weeks" icon={MessageSquare} />
        <Stat label="Delivery rate" value="96.2%" hint="Of all sent" icon={CheckCheck} />
        <Stat label="Failed" value={String(failed)} hint="In recent log window" icon={XCircle} />
        <Stat label="Opted out" value={String(optedOut)} hint="Caregivers unsubscribed" icon={BellOff} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery breakdown</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Last 30 days · all facilities</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {MESSAGE_DELIVERY.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-medium">{d.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.value}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums">{d.value}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Weekly volume</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MESSAGE_VOLUME_TREND} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Bar dataKey="sent" name="Sent" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} fillOpacity={0.4} />
                <Bar dataKey="delivered" name="Delivered" fill="var(--primary)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="read" name="Read" fill="var(--primary)" radius={[4, 4, 0, 0]} fillOpacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Delivery log</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rows.length === MESSAGE_LOG.length
                  ? `${MESSAGE_LOG.length} messages`
                  : `${rows.length} of ${MESSAGE_LOG.length} messages`}
              </p>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { resetPage(setQuery)(""); resetPage(setChannel)("All channels"); resetPage(setStatus)("All statuses"); }}
                className="text-muted-foreground self-start sm:self-auto"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search recipient, facility, template…"
                value={query}
                onChange={(e) => resetPage(setQuery)(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={channel} onValueChange={resetPage(setChannel)}>
              <SelectTrigger className="sm:w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All channels", "WhatsApp", "Voice IVR", "SMS"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={resetPage(setStatus)}>
              <SelectTrigger className="sm:w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All statuses", "delivered", "read", "failed", "opted_out", "queued"].map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s] ?? s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-36">Sent</TableHead>
                  <TableHead className="w-36">Recipient</TableHead>
                  <TableHead className="w-48">Facility</TableHead>
                  <TableHead className="w-28">Channel</TableHead>
                  <TableHead className="w-48">Template</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="pr-6">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6 whitespace-nowrap text-xs text-muted-foreground">{m.sentAt}</TableCell>
                    <TableCell className="font-mono text-xs">{m.recipient}</TableCell>
                    <TableCell className="font-medium text-sm">{m.facility}</TableCell>
                    <TableCell className="text-sm">{m.channel}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.template}</TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">{m.detail}</TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No messages match these filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
          <span>Page {current + 1} of {pageCount} · {facilities.length} facilities</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
