import { PrismaClient } from '@prisma/client';

// Extend the globalThis type to include prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client as a singleton
const prisma = globalThis.prisma || new PrismaClient();

// Store the client in globalThis during development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };