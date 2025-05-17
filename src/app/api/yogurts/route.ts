import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { yogurtSchema } from '@/lib/zodSchemas';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// GET: Fetch all yogurts from the database (public access)
export async function GET() {
  try {
    // Fetch all yogurts using Prisma
    const yogurts = await prisma.yogurt.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        stock: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    // Return yogurts as JSON with 200 status
    return NextResponse.json(yogurts, { status: 200 });
  } catch (error) {
    // Handle database errors
    console.error('Error fetching yogurts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yogurts' },
      { status: 500 }
    );
  }
}

// POST: Create a new yogurt (admin-only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate request body using Zod
    const body = await request.json();
    const data = yogurtSchema.parse(body);

    // Create new yogurt in the database
    const yogurt = await prisma.yogurt.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        stock: data.stock,
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        stock: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return created yogurt with 201 status
    return NextResponse.json(yogurt, { status: 201 });
  } catch (error) {
    // Handle validation or database errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating yogurt:', error);
    return NextResponse.json(
      { error: 'Failed to create yogurt' },
      { status: 500 }
    );
  }
}