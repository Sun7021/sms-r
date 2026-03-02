
export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  popularity: number; // 0-100
  image: string;
  description?: string;
  ingredients: { name: string; quantity: number; unit: string }[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: string[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface DiscountCode {
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  minOrder?: number;
}

export interface Order {
  id: string;
  branchId: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  appliedPromo?: string;
  cgst: number;
  sgst: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod?: 'CASH' | 'UPI' | 'CARD';
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
}

export interface SalesRecord {
  date: string;
  amount: number;
  ordersCount: number;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
  joinedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  timestamp: Date;
  read: boolean;
}
