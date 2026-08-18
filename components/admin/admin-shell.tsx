"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  Sparkles,
  MessageSquare,
  MapPin,
  Menu,
  LogOut,
  User as UserIcon,
  Bell,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CROSS_ALERTS } from "@/lib/admin-data";

const NAV = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/implementors", label: "Implementors", icon: Building2 },
  { href: "/admin/facilities", label: "Facilities", icon: MapPin },
  { href: "/admin/programs", label: "Programs", icon: FolderKanban },
  { href: "/admin/users", label: "User management", icon: ShieldCheck },
  { href: "/admin/billing", label: "Billing & Subscription", icon: CreditCard },
  { href: "/admin/messages", label: "Message Log", icon: MessageSquare },
  { href: "/admin/insights", label: "Insights", icon: Sparkles },
  { href: "/admin/se-alerts", label: "AEFI Alerts", icon: AlertTriangle },
  { href: "/admin/coverage", label: "Coverage", icon: ClipboardList },
  { href: "/admin/audit", label: "Audit Log", icon: ClipboardList },
] as const;

// Stub user — replace with real session data from your API
const STUB_USER = {
  name: "Akosua Mensah",
  email: "akosua@lafyai.org",
  organisation: "lafyai",
};

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    // TODO: call your sign-out API endpoint
    toast.success("Signed out");
    router.push("/auth");
  };

  return (
    <>
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="relative h-12 w-12 shrink-0">
          <Image
            src="/icons/lafyai-icon.png"
            alt="LafyAI logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">lafyai</div>
          <div className="text-[11px] text-sidebar-foreground/60">Super admin console</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => { onNavigate?.(); handleSignOut(); }}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openAlerts = CROSS_ALERTS.filter((a) => a.status !== "resolved").slice(0, 5);

  const handleSignOut = () => {
    toast.success("Signed out");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen w-full bg-muted/40 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <SidebarInner />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center gap-3 px-4 md:px-8">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r-0"
            >
              <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="md:hidden font-semibold flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/icons/lafyai-icon.png" alt="LafyAI" fill className="object-contain" />
            </div>
            lafyai
          </div>

          <Badge variant="secondary" className="hidden sm:inline-flex">
            National oversight
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {openAlerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Cross-implementor AEFI alerts</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {openAlerts.length} open
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {openAlerts.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onClick={() => router.push("/admin/se-alerts")}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="text-sm font-medium truncate">{a.detail}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {a.implementor} · {a.facility} · {a.reportedAt}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/admin/se-alerts")}
                  className="justify-center text-primary"
                >
                  View all AEFI alerts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full hover:bg-muted/60 px-1 py-0.5 transition-colors"
                  aria-label="Open profile menu"
                >
                  <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                    <span className="text-sm font-medium">{STUB_USER.name}</span>
                    <span className="text-xs text-muted-foreground">{STUB_USER.organisation}</span>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials(STUB_USER.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{STUB_USER.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{STUB_USER.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                  <UserIcon className="h-4 w-4" /> User management
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
