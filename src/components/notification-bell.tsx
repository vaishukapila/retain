
'use client';

import { useMemo, useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, orderBy, query } from 'firebase/firestore';
import type { Notification, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'notifications'), orderBy('notificationDate', 'desc')) : null
  , [firestore]);

  const userDocRef = useMemoFirebase(() =>
    firestore && user?.uid ? doc(firestore, 'users', user.uid) : null
  , [firestore, user?.uid]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const { data: userData } = useDoc<User>(userDocRef);

  const unreadNotifications = useMemo(() => {
    if (!notifications || !userData) return [];
    const readIds = userData.readNotificationIds || [];
    return notifications.filter(n => !readIds.includes(n.id));
  }, [notifications, userData]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadNotifications.length > 0 && userDocRef) {
      const unreadIds = unreadNotifications.map(n => n.id);
      try {
        await updateDoc(userDocRef, {
          readNotificationIds: arrayUnion(...unreadIds),
        });
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have {unreadNotifications.length} unread messages.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                >
                  <span className={cn("flex h-2 w-2 translate-y-1.5 rounded-full", 
                    unreadNotifications.some(un => un.id === notification.id) ? 'bg-primary' : 'bg-muted'
                  )} />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                       {formatDistanceToNow(new Date(notification.notificationDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <Mail className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        We'll let you know when we've got something for you.
                    </p>
                </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
    