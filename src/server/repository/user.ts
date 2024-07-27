import { db } from "~/server/db";
import { users, accounts, type User, type Account } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const createAnonymous = async (
  args: Pick<
    Account,
    | "providerAccountId"
    | "refresh_token"
    | "access_token"
    | "expires_at"
    | "token_type"
  >,
): Promise<User> => {
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

    await tx.insert(accounts).values({
      userId,
      type: "other",
      provider: "anonymous",
      ...args,
    });

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
