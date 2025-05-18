'use server';

import { z } from 'zod';
import { yogurtSchema } from '@/lib/zodSchemas';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './types';
import { createErrorResponse, createSuccessResponse, handleActionError } from './utils';

// Type for yogurt creation/update input
export type YogurtFormData = z.infer<typeof yogurtSchema>;

/**
 * Get all yogurts
 */
export async function getYogurts(): Promise<ActionResponse<any[]>> {
  try {
    const yogurts = await prisma.yogurt.findMany();
    return await createSuccessResponse(yogurts);
  } catch (error) {
    console.error('Error fetching yogurts:', error);
    return await createErrorResponse('Failed to fetch yogurts');
  }
}

/**
 * Get a yogurt by ID
 */
export async function getYogurtById(id: string): Promise<ActionResponse<any>> {
  try {
    const yogurt = await prisma.yogurt.findUnique({
      where: { id }
    });
    
    if (!yogurt) {
      return await createErrorResponse('Yogurt not found');
    }
    
    return await createSuccessResponse(yogurt);
  } catch (error) {
    console.error('Error fetching yogurt:', error);
    return await createErrorResponse('Failed to fetch yogurt');
  }
}

/**
 * Create a new yogurt
 */
export async function createYogurt(data: YogurtFormData): Promise<ActionResponse<any>> {
  try {
    // Validate input data
    const validatedData = yogurtSchema.parse(data);
    
    // Check if yogurt with the same name already exists
    const existingYogurt = await prisma.yogurt.findUnique({
      where: { name: validatedData.name }
    });
    
    if (existingYogurt) {
      return await createErrorResponse('Yogurt with this name already exists');
    }
    
    // Create new yogurt in the database
    const newYogurt = await prisma.yogurt.create({
      data: validatedData
    });
    
    // Revalidate the yogurts page to refresh the data
    revalidatePath('/dashboard/yogurts');
    
    return await createSuccessResponse(newYogurt);
  } catch (error) {
    return await handleActionError(error, 'Failed to create yogurt');
  }
}

/**
 * Update an existing yogurt
 */
export async function updateYogurt(id: string, data: YogurtFormData): Promise<ActionResponse<any>> {
  try {
    // Check if yogurt exists
    const existingYogurt = await prisma.yogurt.findUnique({
      where: { id }
    });
    
    if (!existingYogurt) {
      return await createErrorResponse('Yogurt not found');
    }
    
    // Validate input data
    const validatedData = yogurtSchema.parse(data);
    
    // Check if name is already taken by another yogurt
    if (validatedData.name !== existingYogurt.name) {
      const duplicateYogurt = await prisma.yogurt.findUnique({
        where: {
          name: validatedData.name
        }
      });
      
      if (duplicateYogurt) {
        return await createErrorResponse('Yogurt name is already in use');
      }
    }
    
    // Update yogurt in the database
    const updatedYogurt = await prisma.yogurt.update({
      where: { id },
      data: validatedData
    });
    
    // Revalidate the yogurts page to refresh the data
    revalidatePath('/dashboard/yogurts');
    
    return await createSuccessResponse(updatedYogurt);
  } catch (error) {
    return await handleActionError(error, 'Failed to update yogurt');
  }
}

/**
 * Delete a yogurt
 */
export async function deleteYogurt(id: string): Promise<ActionResponse<any>> {
  try {
    // Check if yogurt exists
    const existingYogurt = await prisma.yogurt.findUnique({
      where: { id }
    });
    
    if (!existingYogurt) {
      return await createErrorResponse('Yogurt not found');
    }
    
    // Check if yogurt is referenced in any order items
    const orderItems = await prisma.orderItem.findFirst({
      where: { yogurtId: id }
    });
    
    if (orderItems) {
      return await createErrorResponse('Cannot delete yogurt as it is referenced in orders');
    }
    
    // Delete yogurt from the database
    await prisma.yogurt.delete({
      where: { id }
    });
    
    // Revalidate the yogurts page to refresh the data
    revalidatePath('/dashboard/yogurts');
    
    return await createSuccessResponse({ message: 'Yogurt deleted successfully' });
  } catch (error) {
    console.error('Error deleting yogurt:', error);
    return await createErrorResponse('Failed to delete yogurt');
  }
}
