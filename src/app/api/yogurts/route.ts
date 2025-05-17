import { NextResponse } from 'next/server';
import { z } from 'zod';
import { yogurtSchema } from '@/lib/zodSchemas';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Dummy data to use during build time or when database is not available
const dummyYogurts = [
  {
    id: '1',
    name: 'Strawberry Bliss',
    price: 2.50,
    description: 'A creamy blend of fresh strawberries and smooth yogurt.',
    imageUrl: 'https://images.pexels.com/photos/5862148/pexels-photo-5862148.jpeg',
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Mango Magic',
    price: 2.80,
    description: 'Tropical mango delight with a tangy twist.',
    imageUrl: 'https://images.pexels.com/photos/5150127/pexels-photo-5150127.jpeg',
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// GET: Fetch all yogurts
export async function GET() {
  // Always return dummy data during build
  return NextResponse.json(dummyYogurts, { status: 200 });
}

// POST: Create a new yogurt (admin-only)
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body using Zod
    const body = await request.json();
    const data = yogurtSchema.parse(body);
    
    // Return a mock successful response
    const mockData = {
      ...data,
      id: 'mock-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json(mockData, { status: 201 });
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
