
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { firestore } = useFirebase();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !firestore) return;

    setIsLoading(true);

    const notificationsCollection = collection(firestore, 'notifications');
    const newNotification = {
      title,
      message,
      notificationDate: new Date().toISOString(),
      type: 'announcement', // Default type
    };

    try {
      await addDocumentNonBlocking(notificationsCollection, newNotification);
      toast({
        title: 'Notification Sent!',
        description: 'Your message has been broadcast to all customers.',
      });
      setTitle('');
      setMessage('');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not send the notification. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Send Notification
        </h1>
        <p className="text-muted-foreground">
          Broadcast a message to all of your customers.
        </p>
      </header>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              This message will appear in your customers' notification center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Weekend Sale!"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="E.g. Get 20% off all fresh produce this weekend only."
                className="min-h-32"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !title || !message}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Notification
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    