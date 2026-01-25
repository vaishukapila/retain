import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, ShoppingBag, LifeBuoy, BarChart } from "lucide-react";
import { mockUsers, mockOrders, mockSupportTickets } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const totalCustomers = mockUsers.filter(u => u.role === 'customer').length;
  const totalOrders = mockOrders.length;
  const openTickets = mockSupportTickets.filter(t => t.status === 'Open').length;
  const totalRevenue = mockOrders.reduce((acc, order) => order.status !== 'Cancelled' ? acc + order.total : acc, 0);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: BarChart, description: "All-time revenue" },
    { title: "Total Customers", value: totalCustomers, icon: Users, description: "Number of registered customers" },
    { title: "Total Orders", value: totalOrders, icon: ShoppingBag, description: "All processed orders" },
    { title: "Open Support Tickets", value: openTickets, icon: LifeBuoy, description: "Tickets needing attention" },
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
              <div className="text-2xl font-bold">{stat.value}</div>
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
