"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/icons";
import { UserNav } from "@/components/user-nav";
import {
  LayoutDashboard,
  ShoppingBag,
  Gift,
  Heart,
  LifeBuoy,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/orders",
      label: "My Orders",
      icon: ShoppingBag,
    },
    {
      href: "/dashboard/recommendations",
      label: "For You",
      icon: Heart,
    },
    {
      href: "/dashboard/loyalty",
      label: "Loyalty",
      icon: Gift,
    },
    {
      href: "/dashboard/support",
      label: "Support",
      icon: LifeBuoy,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <Link href="/dashboard" className="block">
            <AppLogo className="h-8 w-auto" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Can add user profile here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger />
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    