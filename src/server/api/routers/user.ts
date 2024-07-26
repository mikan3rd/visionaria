import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  createAnonymous: protectedProcedure.mutation(async ({ ctx, input }) => {
    console.debug("createAnonymous", { ctx, input });
    await ctx.db.transaction(async (_trx) => {
      const user = await ctx.db
        .insert(users)
        .values({
          name: `Guest ${Date.now()}`,
        })
        .returning();
      console.log("user", user);
    });
  }),
});
