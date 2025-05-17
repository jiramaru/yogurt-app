import { NextResponse } from 'next/server';
import { z } from 'zod';
import { userSchema } from '@/lib/zodSchemas';

// Dummy data to use during build time or when database is not available
const dummyUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    phone: '+1234567890',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'user@example.com',
    phone: '+0987654321',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// GET: Fetch all users
export async function GET() {
  // Always return dummy data during build
  return NextResponse.json(dummyUsers, { status: 200 });
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const data = userSchema.parse(body);
    
    // Return a mock successful response
    const mockUser = {
      ...data,
      id: 'new-user-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json(mockUser, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    // Return a generic error
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
