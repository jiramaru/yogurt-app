'use server';

import { z } from 'zod';
import { orderSchema, orderItemSchema } from '@/lib/zodSchemas';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './types';
import { createErrorResponse, createSuccessResponse, handleActionError } from './utils';

// Type for order creation/update input
export type OrderFormData = z.infer<typeof orderSchema> & {
  items: Array<z.infer<typeof orderItemSchema> & { orderId?: string }>;
};

/**
 * Get all orders
 */
export async function getOrders(): Promise<ActionResponse<any[]>> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            yogurt: true
          }
        }
      }
    });
    return await createSuccessResponse(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return await createErrorResponse('Failed to fetch orders');
  }
}

/**
 * Get an order by ID
 */
export async function getOrderById(id: string): Promise<ActionResponse<any>> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            yogurt: true
          }
        }
      }
    });
    
    if (!order) {
      return await createErrorResponse('Order not found');
    }
    
    return await createSuccessResponse(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return await createErrorResponse('Failed to fetch order');
  }
}

/**
 * Create a new order with items
 */
export async function createOrder(data: OrderFormData): Promise<ActionResponse<any>> {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx: any) => {
      // Validate order data
      const validatedOrderData = orderSchema.parse({
        userId: data.userId,
        total: data.total,
        status: data.status
      });
      
      // Create the order first
      const newOrder = await tx.order.create({
        data: {
          userId: validatedOrderData.userId,
          total: validatedOrderData.total,
          status: validatedOrderData.status
        }
      });
      
      // Validate and create each order item
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          // Validate item data
          const validatedItemData = orderItemSchema.parse({
            orderId: newOrder.id, // Use the newly created order ID
            yogurtId: item.yogurtId,
            quantity: item.quantity,
            price: item.price
          });
          
          // Check if yogurt exists and has enough stock
          const yogurt = await tx.yogurt.findUnique({
            where: { id: validatedItemData.yogurtId }
          });
          
          if (!yogurt) {
            throw new Error(`Yogurt with ID ${validatedItemData.yogurtId} not found`);
          }
          
          if (yogurt.stock < validatedItemData.quantity) {
            throw new Error(`Not enough stock for yogurt ${yogurt.name}`);
          }
          
          // Create the order item
          await tx.orderItem.create({
            data: validatedItemData
          });
          
          // Update yogurt stock
          await tx.yogurt.update({
            where: { id: validatedItemData.yogurtId },
            data: { stock: yogurt.stock - validatedItemData.quantity }
          });
        }
      }
      
      // Revalidate the orders page to refresh the data
      revalidatePath('/dashboard/orders');
      
      // Return the created order with its items
      const orderWithItems = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              yogurt: true
            }
          }
        }
      });
      
      return await createSuccessResponse(orderWithItems);
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return await createErrorResponse('Invalid input', error.errors);
    }
    
    console.error('Error creating order:', error);
    return await handleActionError(error, 'Failed to create order');
  }
}

/**
 * Update an existing order's status
 */
export async function updateOrderStatus(id: string, status: string): Promise<ActionResponse<any>> {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });
    
    if (!existingOrder) {
      return await createErrorResponse('Order not found');
    }
    
    // Validate status
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return await createErrorResponse('Invalid status');
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            yogurt: true
          }
        }
      }
    });
    
    // If order is cancelled, return items to stock
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      // Get order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
        include: { yogurt: true }
      });
      
      // Update stock for each item
      for (const item of orderItems) {
        await prisma.yogurt.update({
          where: { id: item.yogurtId },
          data: { stock: item.yogurt.stock + item.quantity }
        });
      }
    }
    
    // Revalidate the orders page to refresh the data
    revalidatePath('/dashboard/orders');
    
    return await createSuccessResponse(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return await handleActionError(error, 'Failed to update order status');
  }
}

/**
 * Delete an order
 */
export async function deleteOrder(id: string): Promise<ActionResponse<any>> {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx: any) => {
      // Check if order exists
      const existingOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true }
      });
      
      if (!existingOrder) {
        return await createErrorResponse('Order not found');
      }
      
      // If order is not cancelled, return items to stock
      if (existingOrder.status !== 'cancelled') {
        // Get order items
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: id },
          include: { yogurt: true }
        });
        
        // Update stock for each item
        for (const item of orderItems) {
          await tx.yogurt.update({
            where: { id: item.yogurtId },
            data: { stock: item.yogurt.stock + item.quantity }
          });
        }
      }
      
      // Delete order items first
      await tx.orderItem.deleteMany({
        where: { orderId: id }
      });
      
      // Delete the order
      await tx.order.delete({
        where: { id }
      });
      
      // Revalidate the orders page to refresh the data
      revalidatePath('/dashboard/orders');
      
      return await createSuccessResponse({ message: 'Order deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return await handleActionError(error, 'Failed to delete order');
  }
}
