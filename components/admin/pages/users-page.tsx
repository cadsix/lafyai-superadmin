"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PLATFORM_USERS, type PlatformUser } from "@/lib/admin-data";
import { cn, initials } from "@/lib/utils";

const STATUS_STYLES: Record<PlatformUser["status"], string> = {
  active:    "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  invited:   "bg-amber-500/10 text-amber-700 border-amber-200",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

const ROLE_STYLES: Record<string, string> = {
  "Super admin":       "bg-violet-500/10 text-violet-700 border-violet-200",
  "Implementor lead":  "bg-primary/10 text-primary border-primary/20",
  "Implementor":       "bg-primary/8 text-primary border-primary/15",
  "Facility admin":    "bg-muted text-muted-foreground border-border",
  "Health worker":     "bg-muted text-muted-foreground border-border",
};

export function UsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [users, setUsers] = useState<PlatformUser[]>(PLATFORM_USERS);

  const roles = Array.from(new Set(PLATFORM_USERS.map((u) => u.role)));

  const rows = useMemo(
    () =>
      users.filter((u) => {
        const matchesQ =
          !q || [u.name, u.email, u.organisation, u.scope].join(" ").toLowerCase().includes(q.toLowerCase());
        return matchesQ && (role === "all" || u.role === role) && (status === "all" || u.status === status);
      }),
    [users, q, role, status],
  );

  const update = (id: string, patch: Partial<PlatformUser>, message: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    toast.success(message);
  };

  const hasFilters = q !== "" || role !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Every user across all portals — roles, facility scope, and account actions."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Users &amp; roles</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rows.length === users.length
                  ? `${users.length} users`
                  : `${rows.length} of ${users.length} users`}
              </p>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQ(""); setRole("all"); setStatus("all"); }}
                className="text-muted-foreground self-start sm:self-auto"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, scope" className="pl-9 h-9" />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9"><SelectValue placeholder="All roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Any status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-56">User</TableHead>
                  <TableHead className="w-40">Role</TableHead>
                  <TableHead className="w-60">Facility scope</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-28">Last active</TableHead>
                  <TableHead className="w-16 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        ROLE_STYLES[u.role] ?? "bg-muted text-muted-foreground border-border",
                      )}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm truncate">{u.scope}</div>
                      <div className="text-xs text-muted-foreground">{u.organisation}</div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLES[u.status],
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          u.status === "active" ? "bg-emerald-500" :
                          u.status === "invited" ? "bg-amber-500" : "bg-destructive",
                        )} />
                        {u.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${u.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Manage {u.name.split(" ")[0]}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => update(u.id, { role: "Implementor lead" }, `${u.name} is now an implementor lead`)}>
                            Make implementor lead
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => update(u.id, { role: "Health worker" }, `${u.name} is now a health worker`)}>
                            Make health worker
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Invite re-sent to ${u.email}`)}>
                            Resend invite
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {u.status === "suspended" ? (
                            <DropdownMenuItem onClick={() => update(u.id, { status: "active" }, `${u.name} reactivated`)}>
                              Reactivate account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => update(u.id, { status: "suspended" }, `${u.name} suspended`)}
                            >
                              Suspend account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No users match these filters</p>
                      </div>
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
