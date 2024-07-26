import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  createAnonymous: publicProcedure.mutation(async ({ ctx }) => {
    console.debug("userRouter.createAnonymous", { ctx });
    const result = await ctx.db.transaction(async (_trx) => {
      const results = await ctx.db
        .insert(users)
        .values({
          name: `Guest ${Date.now()}`,
          email: null,
          emailVerified: null,
          image: null,
        })
        .returning();
      console.log("results", results);
      return results[0];
    });
    return result;
  }),
});
