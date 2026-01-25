"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockOrders, mockProducts } from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";
import Image from "next/image";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const userOrders = mockOrders.filter(o => o.customerId === user?.uid || o.customerId === '1'); // fallback to user 1

  const getBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Processing': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getProductImage = (productId: string) => {
    return mockProducts.find(p => p.id === productId)?.imageUrl || "https://picsum.photos/seed/placeholder/100/100";
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track your past and current purchases.</p>
      </header>
      
      {userOrders.length > 0 ? (
        <div className="space-y-4">
          {userOrders.map(order => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Order {order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">Date: {order.date}</p>
                </div>
                <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image src={getProductImage(item.productId)} alt={item.name} width={64} height={64} className="rounded-md" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="font-bold">Total: ${order.total.toFixed(2)}</p>
                <Button variant="outline">Track Order</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardTitle>No orders found</CardTitle>
          <CardContent>
            <p className="text-muted-foreground mt-2">Looks like you haven't made any purchases yet.</p>
            <Button className="mt-4">Start Shopping</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
