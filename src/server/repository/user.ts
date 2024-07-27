import { db } from "~/server/db";
import { users } from "~/server/db/schema";

type User = typeof users.$inferSelect;

export const createAnonymous = async (): Promise<User> => {
  return await db.transaction(async (tx) => {
    const results = await tx
      .insert(users)
      .values({
        name: `Guest ${Date.now()}`,
        email: null,
        emailVerified: null,
        image: null,
      })
      .returning();

    const user = results[0];
    if (user === undefined) {
      throw new Error("No user created");
    }
    return user;
  });
};
