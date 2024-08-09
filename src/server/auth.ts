import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createClient } from "@supabase/supabase-js";
import type { User } from "next-auth";
import { type NextAuthOptions, getServerSession } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, sessions, users } from "~/server/db/schema";
import { createAnonymous } from "~/server/repository/user";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    name: string;
    isAnonymous: boolean;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends User {
    isAnonymous: undefined;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    isAnonymous: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt: async (params) => {
      // console.debug("jwt callback", params);
      const { token } = params;
      const user = params.user as User | AdapterUser | undefined;
      token.isAnonymous = user?.isAnonymous ?? false;
      return token;
    },
    session: (params) => {
      // console.debug("session callback", params);
      const { session, token } = params;
      if (token.sub === undefined) {
        throw new Error("No user ID found in JWT token");
      }
      session.user.id = token.sub;
      session.user.isAnonymous = token.isAnonymous;
      return session;
    },
  },

  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions, // TODO: 不要であれば削除
  }) as Adapter,

  providers: [
    CredentialsProvider({
      name: "Guest",
      credentials: {},
      async authorize(_credential, _req) {
        const response = await supabase.auth.signInAnonymously();
        // console.debug("signInAnonymously", response);

        if (response.error !== null) {
          console.error(response.error);
          return null;
        }

        if (response.data.user === null) {
          console.error("No data returned from Supabase");
          return null;
        }

        if (response.data.session === null) {
          console.error("No session returned from Supabase");
          return null;
        }

        const {
          data: {
            user: { id },
            session: { refresh_token, access_token, expires_at, token_type },
          },
        } = response;

        const result = await createAnonymous({
          providerAccountId: id,
          refresh_token,
          access_token,
          expires_at: expires_at ?? null,
          token_type,
        });
        // console.debug("result", result);

        const user: User = {
          ...response.data.user,
          id: result.id,
          name: result.name,
          isAnonymous: true,
        };

        return user;
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
