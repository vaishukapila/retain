import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSupportTickets } from "@/lib/mock-data";
import type { SupportTicket } from "@/lib/types";

export default function AdminSupportPage() {
  const getBadgeVariant = (status: SupportTicket['status']) => {
    return status === 'Open' ? 'destructive' : 'default';
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to customer queries.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Open Tickets</CardTitle>
          <CardDescription>Customer issues that need your attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Query</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSupportTickets.map((ticket) => (
                <TableRow key={ticket.id} className={ticket.status === 'Open' ? 'bg-muted/50' : ''}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.customerName}</TableCell>
                  <TableCell>{ticket.date}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{ticket.query}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
