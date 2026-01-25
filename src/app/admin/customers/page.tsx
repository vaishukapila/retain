'use client';
import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';

export default function AdminCustomersPage() {
  const firestore = useFirestore();

  const customersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), where('role', '==', 'customer'))
        : null,
    [firestore]
  );

  const { data: customers, isLoading } = useCollection<User>(customersQuery);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0][0];
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Customer Management
        </h1>
        <p className="text-muted-foreground">
          View and manage your customer base.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>A list of all registered customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && customers && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(customer => (
                  <TableRow key={customer.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={customer.photoURL || undefined}
                            alt={customer.displayName || ''}
                          />
                          <AvatarFallback>
                            {getInitials(customer.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{customer.displayName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {customer.uid}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && !customers?.length && (
            <div className="text-center p-8 text-muted-foreground">
              No customers found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
