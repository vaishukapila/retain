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
import { Badge } from '@/components/ui/badge';
import type { SupportTicket } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function AdminSupportPage() {
  const firestore = useFirestore();

  const ticketsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'support_tickets'),
            orderBy('creationDate', 'desc')
          )
        : null,
    [firestore]
  );
  
  const { data: tickets, isLoading } = useCollection<SupportTicket>(ticketsQuery);

  const getBadgeVariant = (status: SupportTicket['status']) => {
    return status === 'Open' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Support Tickets
        </h1>
        <p className="text-muted-foreground">
          Manage and respond to customer queries.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            Customer issues that need your attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
             <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && tickets && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Query</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TableRow
                    key={ticket.id}
                    className={ticket.status === 'Open' ? 'bg-muted/50' : ''}
                  >
                    <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                    <TableCell>{ticket.customerName}</TableCell>
                    <TableCell>{ticket.userEmail}</TableCell>
                    <TableCell>{new Date(ticket.creationDate).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-sm truncate">
                      {ticket.subject}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && !tickets?.length && (
            <div className="text-center p-8 text-muted-foreground">
              No support tickets found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
