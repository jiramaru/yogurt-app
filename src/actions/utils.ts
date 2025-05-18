'use server';

import { z } from 'zod';
import { ActionResponse } from './types';

/**
 * Utility function to handle server action errors consistently
 * @param error The error object
 * @param defaultMessage Default error message to use if error is not a known type
 * @returns An ActionResponse with error information
 */
export async function handleActionError(error: unknown, defaultMessage: string = 'An unexpected error occurred'): Promise<ActionResponse> {
  console.error('Server action error:', error);
  
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Validation error',
      details: error.errors
    };
  }
  
  // Handle Prisma errors
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    // Extract the error code and message from Prisma error
    const prismaError = error as any;
    const code = prismaError.code;
    
    // Handle specific Prisma error codes
    if (code === 'P2002') {
      return {
        success: false,
        error: 'A record with this value already exists',
        details: prismaError.meta?.target || []
      };
    }
    
    if (code === 'P2025') {
      return {
        success: false,
        error: 'Record not found',
        details: prismaError.meta
      };
    }
    
    return {
      success: false,
      error: `Database error: ${code}`,
      details: prismaError.meta
    };
  }
  
  // Handle generic Error objects
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message || defaultMessage
    };
  }
  
  // Handle unknown errors
  return {
    success: false,
    error: defaultMessage
  };
}

/**
 * Utility function to create a successful response
 * @param data The data to include in the response
 * @returns An ActionResponse with success status and data
 */
export async function createSuccessResponse<T>(data?: T): Promise<ActionResponse<T>> {
  return {
    success: true,
    data
  };
}

/**
 * Utility function to create an error response
 * @param error The error message
 * @param details Optional details about the error
 * @returns An ActionResponse with error information
 */
export async function createErrorResponse(error: string, details?: any): Promise<ActionResponse> {
  return {
    success: false,
    error,
    details
  };
}
