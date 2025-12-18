import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Keep connection alive for better performance
export async function warmUpDatabase() {
  try {
    await prisma.$connect()
  } catch (error) {
    console.error('Database warmup failed:', error)
  }
}


