import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export const createAnonymous = async () => {
  const results = await db
    .insert(users)
    .values({
      name: `Guest ${Date.now()}`,
      email: null,
      emailVerified: null,
      image: null,
    })
    .returning();
  return results[0];
};
