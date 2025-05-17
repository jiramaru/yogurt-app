export interface Yogurt {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    stock: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    orders: OrderItem[];
  }
  
  export interface Order {
    id: string; // Changed from number
    userId: string | null;
    total: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface OrderItem {
    id: string; // Changed from number
    orderId: string; // Changed from number
    yogurtId: string; // Changed from number
    quantity: number;
    price: number;
  }
  
  export interface User {
    id: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }