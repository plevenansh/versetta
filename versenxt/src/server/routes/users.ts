import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '../../lib/prisma';

export const userRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      console.log("Getting all users");
      const users = await prisma.user.findMany();
      console.log("Users fetched:", users);
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }),
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await prisma.user.findUnique({ where: { id: input } });
    }),
 
  create: publicProcedure
  .input(z.object({
    name: z.string(),
    email: z.string().email()
  }))
  .mutation(async ({ input }) => {
    const data: Prisma.UserCreateInput = {
      name: input.name,
      email: input.email
    };
    return await prisma.user.create({ data });
  }),
  
  // create: publicProcedure
  // .input(z.object({
  //   name: z.string(),
  //   email: z.string().email(),
  //   password: z.string(),
  //   role: z.string()
  // }))
  // .mutation(async ({ input }) => {
  //   const hashedPassword = await bcrypt.hash(input.password, 10);
  //   const data: Prisma.UserCreateInput = {
  //     name: input.name,
  //     email: input.email,
  //     password: hashedPassword,
  //     role: input.role
  //   };
  //   return await prisma.user.create({ data });
  // }),

  // Add more user-related procedures as needed
});
