import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type User = typeof users.$inferSelect;

export const createAnonymous = async (): Promise<User> => {
  return await db.transaction(async (tx) => {
    const ids = await tx
      .insert(users)
      .values({
        name: `Guest ${Date.now()}`,
        email: null,
        emailVerified: null,
        image: null,
      })
      .returning({ id: users.id });

    const userId = ids[0]?.id;
    if (userId === undefined) {
      throw new Error("No user ID returned");
    }

    const user = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        accounts: true,
      },
    });
    if (user === undefined) {
      throw new Error("No user created");
    }
    return user;
  });
};
