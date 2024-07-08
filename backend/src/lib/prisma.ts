import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient | undefined
  }
console.log("yeah bruh we reached in prisma file")
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma

