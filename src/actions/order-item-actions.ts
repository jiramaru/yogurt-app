'use server';

import { z } from 'zod';
import { orderItemSchema } from '@/lib/zodSchemas';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './types';
import { createErrorResponse, createSuccessResponse, handleActionError } from './utils';

// Type for order item creation/update input
export type OrderItemFormData = z.infer<typeof orderItemSchema>;

/**
 * Get all order items for a specific order
 */
export async function getOrderItems(orderId: string): Promise<ActionResponse<any[]>> {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: { yogurt: true }
    });
    return await createSuccessResponse(orderItems);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return await createErrorResponse('Failed to fetch order items');
  }
}

/**
 * Get an order item by ID
 */
export async function getOrderItemById(id: string): Promise<ActionResponse<any>> {
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: { yogurt: true }
    });
    
    if (!orderItem) {
      return await createErrorResponse('Order item not found');
    }
    
    return await createSuccessResponse(orderItem);
  } catch (error) {
    console.error('Error fetching order item:', error);
    return await createErrorResponse('Failed to fetch order item');
  }
}

/**
 * Add an item to an existing order
 */
export async function addOrderItem(data: OrderItemFormData): Promise<ActionResponse<any>> {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx: any) => {
      // Validate input data
      const validatedData = orderItemSchema.parse(data);
      
      // Check if order exists
      const order = await tx.order.findUnique({
        where: { id: validatedData.orderId }
      });
      
      if (!order) {
        return await createErrorResponse('Order not found');
      }
      
      // Check if yogurt exists and has enough stock
      const yogurt = await tx.yogurt.findUnique({
        where: { id: validatedData.yogurtId }
      });
      
      if (!yogurt) {
        return createErrorResponse('Yogurt not found');
      }
      
      if (yogurt.stock < validatedData.quantity) {
        return createErrorResponse('Not enough stock available');
      }
      
      // Create the order item
      const newOrderItem = await tx.orderItem.create({
        data: validatedData,
        include: { yogurt: true }
      });
      
      // Update yogurt stock
      await tx.yogurt.update({
        where: { id: validatedData.yogurtId },
        data: { stock: yogurt.stock - validatedData.quantity }
      });
      
      // Update order total
      const newTotal = order.total + (validatedData.price * validatedData.quantity);
      await tx.order.update({
        where: { id: validatedData.orderId },
        data: { total: newTotal }
      });
      
      // Revalidate the orders page to refresh the data
      revalidatePath('/dashboard/orders');
      
      return await createSuccessResponse(newOrderItem);
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return await handleActionError(error, 'Invalid input data');
    }
    
    console.error('Error adding order item:', error);
    return await createErrorResponse('Failed to add order item');
  }
}

/**
 * Update an existing order item
 */
export async function updateOrderItem(id: string, data: Partial<OrderItemFormData>): Promise<ActionResponse<any>> {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx: any) => {
      // Check if order item exists
      const existingItem = await tx.orderItem.findUnique({
        where: { id },
        include: { order: true, yogurt: true }
      });
      
      if (!existingItem) {
        return createErrorResponse('Order item not found');
      }
      
      // Calculate quantity difference if quantity is being updated
      const quantityDiff = data.quantity !== undefined 
        ? data.quantity - existingItem.quantity 
        : 0;
      
      // Check if yogurt has enough stock for the quantity update
      if (quantityDiff > 0) {
        const yogurt = await tx.yogurt.findUnique({
          where: { id: existingItem.yogurtId }
        });
        
        if (!yogurt) {
          return await createErrorResponse('Yogurt not found');
        }
        
        if (yogurt.stock < quantityDiff) {
          return await createErrorResponse('Not enough stock available');
        }
        
        // Update yogurt stock
        await tx.yogurt.update({
          where: { id: existingItem.yogurtId },
          data: { stock: yogurt.stock - quantityDiff }
        });
      } else if (quantityDiff < 0) {
        // If reducing quantity, add back to stock
        await tx.yogurt.update({
          where: { id: existingItem.yogurtId },
          data: { stock: existingItem.yogurt.stock + Math.abs(quantityDiff) }
        });
      }
      
      // Calculate price difference for order total
      const oldItemTotal = existingItem.price * existingItem.quantity;
      const newItemTotal = (data.price || existingItem.price) * (data.quantity || existingItem.quantity);
      const priceDiff = newItemTotal - oldItemTotal;
      
      // Update order total
      if (priceDiff !== 0) {
        await tx.order.update({
          where: { id: existingItem.orderId },
          data: { total: existingItem.order.total + priceDiff }
        });
      }
      
      // Update the order item
      const updatedItem = await tx.orderItem.update({
        where: { id },
        data: {
          quantity: data.quantity !== undefined ? data.quantity : undefined,
          price: data.price !== undefined ? data.price : undefined
        },
        include: { yogurt: true }
      });
      
      // Revalidate the orders page to refresh the data
      revalidatePath('/dashboard/orders');
      
      return await createSuccessResponse(updatedItem);
    });
  } catch (error) {
    console.error('Error updating order item:', error);
    return await createErrorResponse('Failed to update order item');
  }
}

/**
 * Remove an item from an order
 */
export async function removeOrderItem(id: string): Promise<ActionResponse<any>> {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx: any) => {
      // Check if order item exists
      const existingItem = await tx.orderItem.findUnique({
        where: { id },
        include: { order: true, yogurt: true }
      });
      
      if (!existingItem) {
        return createErrorResponse('Order item not found');
      }
      
      // Calculate the amount to subtract from order total
      const itemTotal = existingItem.price * existingItem.quantity;
      
      // Update order total
      await tx.order.update({
        where: { id: existingItem.orderId },
        data: { total: existingItem.order.total - itemTotal }
      });
      
      // Return quantity to yogurt stock
      await tx.yogurt.update({
        where: { id: existingItem.yogurtId },
        data: { stock: existingItem.yogurt.stock + existingItem.quantity }
      });
      
      // Delete the order item
      await tx.orderItem.delete({
        where: { id }
      });
      
      // Revalidate the orders page to refresh the data
      revalidatePath('/dashboard/orders');
      
      return await createSuccessResponse({ message: 'Order item removed successfully' });
    });
  } catch (error) {
    console.error('Error removing order item:', error);
    return await createErrorResponse('Failed to remove order item');
  }
}
