import { NextResponse } from 'next/server';
import { z } from 'zod';
import { yogurtSchema } from '@/lib/zodSchemas';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all yogurts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Return a specific yogurt if ID is provided
      const yogurt = await prisma.yogurt.findUnique({
        where: { id }
      });
      
      if (!yogurt) {
        return NextResponse.json({ error: 'Yogurt not found' }, { status: 404 });
      }
      
      return NextResponse.json(yogurt, { status: 200 });
    }
    
    // Return all yogurts
    const yogurts = await prisma.yogurt.findMany();
    return NextResponse.json(yogurts, { status: 200 });
  } catch (error) {
    console.error('Error fetching yogurts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yogurts' },
      { status: 500 }
    );
  }
}

// POST: Create a new yogurt
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body using Zod
    const body = await request.json();
    const data = yogurtSchema.parse(body);
    
    // Check if yogurt with the same name already exists
    const existingYogurt = await prisma.yogurt.findUnique({
      where: { name: data.name }
    });
    
    if (existingYogurt) {
      return NextResponse.json(
        { error: 'A yogurt with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new yogurt in the database
    const newYogurt = await prisma.yogurt.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        stock: data.stock
      }
    });
    
    return NextResponse.json(newYogurt, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating yogurt:', error);
    // Return a generic error
    return NextResponse.json(
      { error: 'Failed to create yogurt' },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing yogurt
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Yogurt ID is required' }, { status: 400 });
    }
    
    // Check if yogurt exists
    const existingYogurt = await prisma.yogurt.findUnique({
      where: { id }
    });
    
    if (!existingYogurt) {
      return NextResponse.json({ error: 'Yogurt not found' }, { status: 404 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const data = yogurtSchema.parse(body);
    
    // Check if name is being changed and if it's already taken
    if (data.name !== existingYogurt.name) {
      const duplicateYogurt = await prisma.yogurt.findUnique({
        where: { name: data.name }
      });
      
      if (duplicateYogurt) {
        return NextResponse.json(
          { error: 'A yogurt with this name already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update yogurt in the database
    const updatedYogurt = await prisma.yogurt.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        stock: data.stock
      }
    });
    
    return NextResponse.json(updatedYogurt, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating yogurt:', error);
    // Return a generic error
    return NextResponse.json(
      { error: 'Failed to update yogurt' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a yogurt
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Yogurt ID is required' }, { status: 400 });
    }
    
    // Check if yogurt exists
    const existingYogurt = await prisma.yogurt.findUnique({
      where: { id }
    });
    
    if (!existingYogurt) {
      return NextResponse.json({ error: 'Yogurt not found' }, { status: 404 });
    }
    
    // Delete yogurt from the database
    await prisma.yogurt.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'Yogurt deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting yogurt:', error);
    return NextResponse.json(
      { error: 'Failed to delete yogurt' },
      { status: 500 }
    );
  }
}
