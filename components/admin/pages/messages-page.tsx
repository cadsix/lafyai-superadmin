"use client";

import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import type { MessageLogMetrics, MessageLogEntry } from "@/lib/types";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, string> = {
  delivered: "Delivered", read: "Read", failed: "Failed",
  opted_out: "Opted out", queued: "Queued", sent: "Sent",
};
const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  read:      "bg-primary/10 text-primary border-primary/20",
  failed:    "bg-destructive/10 text-destructive border-destructive/20",
  opted_out: "bg-muted text-muted-foreground border-border",
  queued:    "bg-amber-500/10 text-amber-700 border-amber-200",
  sent:      "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
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
          <div className="rounded-lg bg-primary/8 p-2 text-primary shrink-0"><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MessagesPage({
  metrics,
  messages,
}: {
  metrics: MessageLogMetrics | null;
  messages: MessageLogEntry[];
}) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All channels");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(0);

  const m = metrics ?? {
    total_sent_4_weeks: 0,
    delivery_rate_pct: 0,
    failed_count: 0,
    opted_out_count: 0,
    channel_breakdown_30d: { delivered_pct: 0, read_pct: 0, failed_pct: 0, opted_out_pct: 0 },
  };

  const channels = useMemo(
    () => ["All channels", ...Array.from(new Set(messages.map((msg) => msg.channel)))],
    [messages],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((msg) =>
      (channel === "All channels" || msg.channel === channel) &&
      (status === "All statuses" || msg.status === status) &&
      (q === "" || msg.recipient_id.toLowerCase().includes(q) || msg.facility.toLowerCase().includes(q) || msg.template.toLowerCase().includes(q)),
    );
  }, [query, channel, status, messages]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const resetPage =
    <T,>(fn: (v: T) => void) =>
    (v: T) => { fn(v); setPage(0); };

  const hasFilters = query !== "" || channel !== "All channels" || status !== "All statuses";

  // Channel breakdown bars
  const breakdown = [
    { label: "Delivered", value: m.channel_breakdown_30d.delivered_pct },
    { label: "Read",      value: m.channel_breakdown_30d.read_pct },
    { label: "Failed",    value: m.channel_breakdown_30d.failed_pct },
    { label: "Opted out", value: m.channel_breakdown_30d.opted_out_pct },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Message log"
        description="Every reminder sent across all facilities, with delivery outcome."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Messages sent" value={m.total_sent_4_weeks.toLocaleString()} hint="Last 4 weeks" icon={MessageSquare} />
        <Stat label="Delivery rate" value={`${m.delivery_rate_pct.toFixed(1)}%`} hint="Of all sent" icon={CheckCheck} />
        <Stat label="Failed" value={String(m.failed_count)} hint="In recent log window" icon={XCircle} />
        <Stat label="Opted out" value={String(m.opted_out_count)} hint="Caregivers unsubscribed" icon={BellOff} />
      </div>

      {breakdown.some((b) => b.value > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery breakdown</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Last 30 days · all facilities</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-medium">{d.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.value}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums">{d.value.toFixed(1)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Delivery log</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rows.length === messages.length ? `${messages.length} messages` : `${rows.length} of ${messages.length} messages`}
              </p>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { resetPage(setQuery)(""); resetPage(setChannel)("All channels"); resetPage(setStatus)("All statuses"); }} className="text-muted-foreground self-start sm:self-auto">
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search recipient, facility, template…" value={query} onChange={(e) => resetPage(setQuery)(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={channel} onValueChange={resetPage(setChannel)}>
              <SelectTrigger className="sm:w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{channels.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                  <TableHead className="w-28 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="pl-6 whitespace-nowrap text-xs text-muted-foreground">{msg.sent_at}</TableCell>
                    <TableCell className="font-mono text-xs">{msg.recipient_id}</TableCell>
                    <TableCell className="font-medium text-sm">{msg.facility}</TableCell>
                    <TableCell className="text-sm">{msg.channel}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{msg.template}</TableCell>
                    <TableCell className="pr-6"><StatusBadge status={msg.status} /></TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
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
          <span>Page {current + 1} of {pageCount}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
