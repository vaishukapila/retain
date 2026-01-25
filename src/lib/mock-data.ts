import type { User, Product, Order, LoyaltyInfo, SupportTicket, Notification } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockUsers: User[] = [
  { uid: '1', email: 'customer@test.com', displayName: 'John Doe', photoURL: 'https://i.pravatar.cc/150?u=customer@test.com', role: 'customer' },
  { uid: '2', email: 'admin@test.com', displayName: 'Admin User', photoURL: 'https://i.pravatar.cc/150?u=admin@test.com', role: 'admin' },
  { uid: '3', email: 'jane.doe@test.com', displayName: 'Jane Doe', photoURL: 'https://i.pravatar.cc/150?u=jane.doe@test.com', role: 'customer' },
  { uid: '4', email: 'sam.jones@test.com', displayName: 'Sam Jones', photoURL: 'https://i.pravatar.cc/150?u=sam.jones@test.com', role: 'customer' },
];

export const mockProducts: Product[] = PlaceHolderImages.map(img => ({
  id: img.id,
  name: img.description.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
  description: "A high-quality product that you'll love. Made with the finest materials.",
  imageUrl: img.imageUrl,
  imageHint: img.imageHint,
}));

export const mockOrders: Order[] = [
  {
    id: 'ORD001', customerId: '1', customerName: 'John Doe', date: '2024-07-20', status: 'Delivered', total: 149.98,
    items: [
      { productId: 'product-1', quantity: 1, name: mockProducts[0].name, price: mockProducts[0].price },
      { productId: 'product-2', quantity: 1, name: mockProducts[1].name, price: mockProducts[1].price },
    ],
  },
  {
    id: 'ORD002', customerId: '1', customerName: 'John Doe', date: '2024-07-28', status: 'Shipped', total: 79.99,
    items: [{ productId: 'product-3', quantity: 1, name: mockProducts[2].name, price: mockProducts[2].price }],
  },
  {
    id: 'ORD003', customerId: '3', customerName: 'Jane Doe', date: '2024-07-29', status: 'Processing', total: 205.50,
    items: [
      { productId: 'product-4', quantity: 2, name: mockProducts[3].name, price: mockProducts[3].price },
      { productId: 'product-5', quantity: 1, name: mockProducts[4].name, price: mockProducts[4].price },
    ],
  },
  {
    id: 'ORD004', customerId: '4', customerName: 'Sam Jones', date: '2024-07-30', status: 'Cancelled', total: 32.75,
    items: [{ productId: 'product-6', quantity: 1, name: mockProducts[5].name, price: mockProducts[5].price }],
  },
];

export const mockLoyaltyInfo: LoyaltyInfo = {
  points: 1250,
  tier: 'Silver',
  pointsToNextTier: 750,
  history: [
    { date: '2024-07-28', activity: 'Purchase ORD002', points: 80 },
    { date: '2024-07-20', activity: 'Purchase ORD001', points: 150 },
    { date: '2024-07-15', activity: 'Tier Upgrade Bonus', points: 500 },
    { date: '2024-07-10', activity: 'Redeemed for discount', points: -200 },
  ],
};

export const mockNotifications: Notification[] = [
    { id: '1', title: 'Order Shipped!', description: 'Your order #ORD002 has been shipped and is on its way.', date: '2024-07-28', read: false },
    { id: '2', title: 'New Loyalty Reward', description: 'You have enough points to claim a $10 discount!', date: '2024-07-27', read: false },
    { id: '3', title: 'Welcome to Retain.ai!', description: 'Thanks for signing up. Enjoy your personalized shopping experience.', date: '2024-07-20', read: true },
];
