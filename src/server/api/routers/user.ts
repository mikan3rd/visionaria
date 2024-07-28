import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUser } from "~/server/repository/user";

export const userRouter = createTRPCRouter({
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUser(ctx.session.user.id);
    if (user === undefined) {
      throw new Error("User not found");
    }
    return user;
  }),
});
