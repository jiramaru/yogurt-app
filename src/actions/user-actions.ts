'use server';

import { z } from 'zod';
import { userSchema } from '@/lib/zodSchemas';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './types';
import { handleActionError, createSuccessResponse, createErrorResponse } from './utils';

// Type for user creation/update input
export type UserFormData = z.infer<typeof userSchema>;

/**
 * Get all users
 */
export async function getUsers(): Promise<ActionResponse<any[]>> {
  try {
    const users = await prisma.user.findMany();
    return await createSuccessResponse(users);
  } catch (error) {
    return await handleActionError(error, 'Failed to fetch users');
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return await createErrorResponse('User not found');
    }
    
    return await createSuccessResponse(user);
  } catch (error) {
    return await handleActionError(error, 'Failed to fetch user');
  }
}

/**
 * Create a new user
 */
export async function createUser(data: UserFormData): Promise<ActionResponse<any>> {
  try {
    // Validate input data
    const validatedData = userSchema.parse(data);
    
    // Check if user with the same email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone || '' }
        ]
      }
    });
    
    if (existingUser) {
      return await createErrorResponse('User with this email or phone already exists');
    }
    
    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        phone: validatedData.phone || '',
        role: validatedData.role || 'admin'
      }
    });
    
    // Revalidate the users page to refresh the data
    revalidatePath('/dashboard/users');
    
    return await createSuccessResponse(newUser);
  } catch (error) {
    return await handleActionError(error, 'Failed to create user');
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UserFormData): Promise<ActionResponse<any>> {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return await createErrorResponse('User not found');
    }
    
    // Validate input data
    const validatedData = userSchema.parse(data);
    
    // Check if email or phone is already taken by another user
    if (validatedData.email !== existingUser.email || validatedData.phone !== existingUser.phone) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedData.email },
            { phone: validatedData.phone || '' }
          ],
          NOT: {
            id
          }
        }
      });
      
      if (duplicateUser) {
        return await createErrorResponse('Email or phone is already in use by another user');
      }
    }
    
    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: validatedData.email,
        phone: validatedData.phone || '',
        role: validatedData.role || existingUser.role
      }
    });
    
    // Revalidate the users page to refresh the data
    revalidatePath('/dashboard/users');
    
    return await createSuccessResponse(updatedUser);
  } catch (error) {
    return await handleActionError(error, 'Failed to update user');
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<ActionResponse<any>> {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return await createErrorResponse('User not found');
    }
    
    // Delete user from the database
    await prisma.user.delete({
      where: { id }
    });
    
    // Revalidate the users page to refresh the data
    revalidatePath('/dashboard/users');
    
    return await createSuccessResponse({ message: 'User deleted successfully' });
  } catch (error) {
    return await handleActionError(error, 'Failed to delete user');
  }
}
