'use server';

import { prisma } from '@/lib/prisma';
import { ActionResponse } from './types';
import { handleActionError, createSuccessResponse } from './utils';

// Type definitions for dashboard data
export type DashboardStats = {
  totalYogurts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
};

export type TopSellingYogurt = {
  id: string;
  name: string;
  sold: number;
};

export type RecentOrder = {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
};

export type LowStockYogurt = {
  id: string;
  name: string;
  stock: number;
};

/**
 * Fetches dashboard statistics from the database
 * @returns Object containing total counts and revenue
 */
export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  try {
    // Get total yogurts count
    const totalYogurts = await prisma.yogurt.count();
    
    // Get total orders count
    const totalOrders = await prisma.order.count();
    
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Calculate total revenue from all completed orders
    const orders = await prisma.order.findMany({
      where: {
        status: 'completed'
      },
      select: {
        total: true
      }
    });
    
    // Use explicit type for order
    type OrderWithTotal = { total: number };
    const totalRevenue = orders.reduce((sum: number, order: OrderWithTotal) => sum + order.total, 0);
    
    return createSuccessResponse({
      totalYogurts,
      totalOrders,
      totalUsers,
      totalRevenue,
    });
  } catch (error) {
    return handleActionError(error, 'Failed to fetch dashboard statistics');
  }
}

/**
 * Fetches top selling yogurts
 * @param limit Number of top yogurts to return
 * @returns Array of top selling yogurts with sales count
 */
export async function getTopSellingYogurts(limit = 3): Promise<ActionResponse<TopSellingYogurt[]>> {
  try {
    // Get all order items with yogurt information
    const orderItems = await prisma.orderItem.findMany({
      include: {
        yogurt: true,
        order: true
      },
      where: {
        order: {
          status: 'completed'
        }
      }
    });
    
    // Define explicit type for order item with yogurt
    type OrderItemWithYogurt = {
      yogurtId: string;
      quantity: number;
      yogurt: {
        name: string;
      };
    };
    
    // Group by yogurt and count quantities with proper typing
    const yogurtSales = orderItems.reduce((acc: Record<string, TopSellingYogurt>, item: OrderItemWithYogurt) => {
      const yogurtId = item.yogurtId;
      if (!acc[yogurtId]) {
        acc[yogurtId] = {
          id: yogurtId,
          name: item.yogurt.name,
          sold: 0,
        };
      }
      acc[yogurtId].sold += item.quantity;
      return acc;
    }, {});
    
    // Convert to array and sort by sold count
    const topYogurtsArray: TopSellingYogurt[] = Object.values(yogurtSales);
    const sortedTopYogurts = [...topYogurtsArray]
      .sort((a: TopSellingYogurt, b: TopSellingYogurt) => b.sold - a.sold)
      .slice(0, limit);
    
    return createSuccessResponse(sortedTopYogurts);
  } catch (error) {
    return handleActionError(error, 'Failed to fetch top selling yogurts');
  }
}

/**
 * Fetches recent orders
 * @param limit Number of recent orders to return
 * @returns Array of recent orders
 */
export async function getRecentOrders(limit = 3): Promise<ActionResponse<RecentOrder[]>> {
  try {
    const recentOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    return createSuccessResponse(recentOrders);
  } catch (error) {
    return handleActionError(error, 'Failed to fetch recent orders');
  }
}

/**
 * Fetches yogurts with low stock
 * @param threshold Stock threshold to consider as low
 * @param limit Number of items to return
 * @returns Array of yogurts with low stock
 */
export async function getLowStockYogurts(threshold = 15, limit = 3): Promise<ActionResponse<LowStockYogurt[]>> {
  try {
    const lowStockYogurts = await prisma.yogurt.findMany({
      where: {
        stock: {
          lte: threshold,
        },
      },
      orderBy: {
        stock: 'asc',
      },
      take: limit,
      select: {
        id: true,
        name: true,
        stock: true
      }
    });
    
    return createSuccessResponse(lowStockYogurts);
  } catch (error) {
    return handleActionError(error, 'Failed to fetch low stock yogurts');
  }
}
