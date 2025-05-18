"use server";

import { prisma } from "./prisma";

// Define types for return values
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
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total yogurts count
    const totalYogurts = await prisma.yogurt.count();
    
    // Get total orders count
    const totalOrders = await prisma.order.count();
    
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Calculate total revenue from all orders
    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    
    return {
      totalYogurts,
      totalOrders,
      totalUsers,
      totalRevenue,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

/**
 * Fetches top selling yogurts
 * @param limit Number of top yogurts to return
 * @returns Array of top selling yogurts with sales count
 */
export async function getTopSellingYogurts(limit = 3): Promise<TopSellingYogurt[]> {
  try {
    // Get all order items with yogurt information
    const orderItems = await prisma.orderItem.findMany({
      include: {
        yogurt: true,
      },
    });
    
    // Group by yogurt and count quantities
    const yogurtSales = orderItems.reduce((acc: Record<string, { id: string; name: string; sold: number }>, item: any) => {
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
    }, {} as Record<string, { id: string; name: string; sold: number }> );
    
    // Convert to array and sort by sold count
    const topYogurts = Object.values(yogurtSales)
      .sort((a, b) => (b as TopSellingYogurt).sold - (a as TopSellingYogurt).sold)
      .slice(0, limit);
    
    return topYogurts as TopSellingYogurt[];
  } catch (error) {
    console.error("Error fetching top selling yogurts:", error);
    throw new Error("Failed to fetch top selling yogurts");
  }
}

/**
 * Fetches recent orders
 * @param limit Number of recent orders to return
 * @returns Array of recent orders
 */
export async function getRecentOrders(limit = 3): Promise<RecentOrder[]> {
  try {
    const recentOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
    
    return recentOrders as RecentOrder[];
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw new Error("Failed to fetch recent orders");
  }
}

/**
 * Fetches yogurts with low stock
 * @param threshold Stock threshold to consider as low
 * @param limit Number of items to return
 * @returns Array of yogurts with low stock
 */
export async function getLowStockYogurts(threshold = 15, limit = 3): Promise<LowStockYogurt[]> {
  try {
    const lowStockYogurts = await prisma.yogurt.findMany({
      where: {
        stock: {
          lte: threshold,
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: limit,
    });
    
    return lowStockYogurts as LowStockYogurt[];
  } catch (error) {
    console.error("Error fetching low stock yogurts:", error);
    throw new Error("Failed to fetch low stock yogurts");
  }
}
