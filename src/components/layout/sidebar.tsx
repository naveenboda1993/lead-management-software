"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  CheckSquare,
  FileText,
  ScrollText,
  Settings,
  ChevronLeft,
  X,
  Building2,
  Package,
  ShoppingCart,
  Truck,
  Megaphone,
  BarChart3,
  DollarSign,
  UserCog,
  CalendarCheck,
  CalendarRange,
  Wallet,
  Ticket,
  Globe,
  Layers,
  Bell,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { useNotifications } from "@/hooks/use-notifications";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLES } from "@/lib/constants";
import type { Role } from "@/types";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subject?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "CRM",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, subject: "report" },
      { href: "/dashboard/employer", label: "Employer Dashboard", icon: LayoutDashboard, subject: "report" },
      { href: "/dashboard/employee", label: "Employee Dashboard", icon: LayoutDashboard, subject: "report" },
      { href: "/dashboard/marketing", label: "Marketing Dashboard", icon: LayoutDashboard, subject: "report" },
      { href: "/dashboard/sales", label: "Sales Dashboard", icon: LayoutDashboard, subject: "report" },
      { href: "/leads", label: "Leads", icon: Users, subject: "lead" },
      { href: "/pipeline", label: "Pipeline", icon: GitBranch, subject: "lead" },
      { href: "/tasks", label: "Tasks", icon: CheckSquare, subject: "task" },
    ],
  },
  {
    label: "Real Estate",
    items: [
      { href: "/properties", label: "Properties", icon: Building2, subject: "property" },
      { href: "/brokers", label: "Brokers", icon: Users, subject: "broker" },
    ],
  },
  {
    label: "Ecommerce",
    items: [
      { href: "/products", label: "Products", icon: Package, subject: "product" },
      { href: "/orders", label: "Orders", icon: ShoppingCart, subject: "order" },
      { href: "/suppliers", label: "Suppliers", icon: Truck, subject: "supplier" },
      { href: "/coupons", label: "Coupons", icon: DollarSign, subject: "coupon" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/campaigns", label: "Campaigns", icon: Megaphone, subject: "campaign" },
      { href: "/google-ads", label: "Google Ads", icon: BarChart3, subject: "ads" },
      { href: "/adsense", label: "AdSense", icon: DollarSign, subject: "adsense" },
    ],
  },
  {
    label: "HR",
    items: [
      { href: "/employees", label: "Employees", icon: UserCog, subject: "user" },
      { href: "/employees/attendance", label: "Attendance", icon: CalendarCheck, subject: "attendance" },
      { href: "/employees/leaves", label: "Leaves", icon: CalendarRange, subject: "leave" },
      { href: "/employees/payroll", label: "Payroll", icon: Wallet, subject: "payroll" },
      { href: "/employees/performance-reviews", label: "Performance Reviews", icon: Star, subject: "performance_review" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/tickets", label: "Tickets", icon: Ticket, subject: "ticket" },
    ],
  },
  {
    label: "Customer Portal",
    items: [
      { href: "/portal", label: "Portal", icon: Globe, subject: "portal" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/documents", label: "Documents", icon: FileText, subject: "document" },
      { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, subject: "report" },
      { href: "/settings", label: "Settings", icon: Settings, subject: "setting" },
    ],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const { unreadCount } = useNotifications();
  const { can, loading: permLoading } = usePermissions();

  const visibleSections = useMemo(() => {
    if (permLoading) return navSections;
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => !item.subject || can("read", item.subject) || can("manage", item.subject)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [permLoading, can]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              LC
            </div>
            <span>LeadCRM</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="flex flex-col gap-4">
            {visibleSections.map((section) => (
              <div key={section.label}>
                <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  {section.label}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.href === "/notifications" && unreadCount > 0 && (
                          <Badge
                            variant="default"
                            className="ml-auto h-5 min-w-[1.25rem] px-1 text-[10px]"
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : user ? (
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 h-4">
                  {ROLES[user.role as Role] ?? user.role}
                </Badge>
              </div>
              <ChevronLeft className="ml-auto h-4 w-4 rotate-180 text-muted-foreground" />
            </Link>
          ) : null}
        </div>
      </aside>
    </>
  );
}
