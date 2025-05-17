import { z } from 'zod';

// Schema for validating Yogurt data
export const yogurtSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  imageUrl: z.string().url('Invalid URL'),
  stock: z.number().int().min(0, 'Stock must be a positive integer'),
});

// Schema for validating Order data
export const orderSchema = z.object({
  userId: z.string().uuid('Invalid user ID').nullable(), // Optional, allows guest checkout
  total: z.number().min(0, 'Total must be positive'),
  status: z.enum(['pending', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }).default('pending'),
});

// Schema for validating OrderItem data
export const orderItemSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  yogurtId: z.string().uuid('Invalid yogurt ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
});

// Schema for validating User data
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')), // Allows empty string or undefined
  role: z.enum(['admin', 'customer'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }).default('admin'),
});