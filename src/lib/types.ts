export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'customer';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: {
    productId: string;
    quantity: number;
    name: string;
    price: number;
  }[];
}

export interface LoyaltyInfo {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  pointsToNextTier: number;
  history: {
    date: string;
    activity: string;
    points: number;
  }[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  customerName: string;
  userEmail: string;
  creationDate: string;
  subject: string;
  status: 'Open' | 'Resolved';
}


export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}
