'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, ShoppingBag, LifeBuoy, BarChart, Loader2 } from "lucide-react";
import { mockOrders } from "@/lib/mock-data";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { SupportTicket, User } from "@/lib/types";

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const customersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), where('role', '==', 'customer'))
        : null,
    [firestore]
  );
  const { data: customers, isLoading: isLoadingCustomers } = useCollection<User>(customersQuery);

  const openTicketsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'support_tickets'), where('status', '==', 'Open'))
        : null,
    [firestore]
  );
  const { data: openTicketsData, isLoading: isLoadingTickets } = useCollection<SupportTicket>(openTicketsQuery);

  // For now, we continue to use mock data for orders as they are nested under users.
  // This would require a larger refactor to query all orders efficiently.
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((acc, order) => order.status !== 'Cancelled' ? acc + order.total : acc, 0);

  const isLoading = isLoadingCustomers || isLoadingTickets;

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: BarChart, description: "All-time revenue" },
    { title: "Total Customers", value: customers?.length ?? 0, icon: Users, description: "Number of registered customers" },
    { title: "Total Orders", value: totalOrders, icon: ShoppingBag, description: "All processed orders" },
    { title: "Open Support Tickets", value: openTicketsData?.length ?? 0, icon: LifeBuoy, description: "Tickets needing attention" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">A quick look at your store's performance.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading && (stat.title === "Total Customers" || stat.title === "Open Support Tickets") ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* More components for charts and recent activity can be added here */}
      <div className="text-center text-muted-foreground mt-8">
        <p>More detailed analytics coming soon.</p>
      </div>
    </div>
  );
}
