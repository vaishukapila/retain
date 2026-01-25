"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, ShoppingBag, ArrowRight } from "lucide-react";
import { mockLoyaltyInfo, mockOrders } from "@/lib/mock-data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const recentOrder = mockOrders.find(o => o.customerId === user?.uid) || mockOrders[1];

  const getBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Processing': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's new with your account.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLoyaltyInfo.points}</div>
            <p className="text-xs text-muted-foreground">{mockLoyaltyInfo.pointsToNextTier} points to next tier</p>
            <Button variant="link" asChild className="p-0 h-auto mt-4">
              <Link href="/dashboard/loyalty">View Rewards <ArrowRight className="ml-1 h-4 w-4"/></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Recent Order</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentOrder ? (
                <>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg font-bold">{recentOrder.id}</p>
                        <p className="text-xs text-muted-foreground">Placed on {recentOrder.date}</p>
                    </div>
                    <Badge variant={getBadgeVariant(recentOrder.status)}>{recentOrder.status}</Badge>
                </div>
                 <Button variant="link" asChild className="p-0 h-auto mt-4">
                    <Link href="/dashboard/orders">View All Orders <ArrowRight className="ml-1 h-4 w-4"/></Link>
                </Button>
                </>
            ) : (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                     <Button asChild className="mt-4">
                        <Link href="/dashboard/recommendations">Start Shopping</Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Just For You</CardTitle>
          <CardDescription>
            Personalized recommendations based on your shopping history.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Discover products you'll love.</p>
           <Button asChild>
            <Link href="/dashboard/recommendations">
                <ArrowRight className="mr-2 h-4 w-4" /> Get Recommendations
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
