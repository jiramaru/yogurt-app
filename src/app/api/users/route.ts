import { NextResponse } from 'next/server';
import { z } from 'zod';
import { userSchema } from '@/lib/zodSchemas';
import { prisma } from '@/lib/prisma';

// GET: Fetch all users
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Return a specific user if ID is provided
      const user = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json(user, { status: 200 });
    }
    
    // Return all users
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const data = userSchema.parse(body);
    
    // Check if user with the same email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone || '' }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 409 }
      );
    }
    
    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone || '',
        role: data.role || 'admin'
      }
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating user:', error);
    // Return a generic error
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing user
export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const data = userSchema.parse(body);
    
    // Check if email or phone is already taken by another user
    if (data.email !== existingUser.email || data.phone !== existingUser.phone) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { phone: data.phone || '' }
          ],
          NOT: {
            id
          }
        }
      });
      
      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Email or phone is already in use by another user' },
          { status: 409 }
        );
      }
    }
    
    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        phone: data.phone || '',
        role: data.role || existingUser.role
      }
    });
    
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating user:', error);
    // Return a generic error
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete user from the database
    await prisma.user.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
