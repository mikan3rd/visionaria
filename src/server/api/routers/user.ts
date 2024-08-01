import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUser } from "~/server/repository/user";

const SelfUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  accounts: z.array(
    z.object({
      id: z.number(),
      provider: z.string(),
    }),
  ),
});

export const userRouter = createTRPCRouter({
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUser(ctx.session.user.id);
    if (user === undefined) {
      throw new Error("User not found");
    }
    return SelfUserSchema.parse(user);
  }),
});
