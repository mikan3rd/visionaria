import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { type Account, type User, accounts, users } from "~/server/db/schema";

export const getUser = async (
  id: string,
): Promise<(User & { accounts: Account[] }) | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      accounts: true,
    },
  });
};

export const updateUser = async (
  id: string,
  args: Omit<Partial<User>, "id">,
) => {
  return await db.update(users).set(args).where(eq(users.id, id));
};

export const createAnonymous = async (
  args: Pick<
    Account,
    | "providerAccountId"
    | "refresh_token"
    | "access_token"
    | "expires_at"
    | "token_type"
  >,
): Promise<User & { accounts: Account[] }> => {
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
