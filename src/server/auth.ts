import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type User } from "next-auth";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
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
      console.debug("jwt callback", params);
      const { token } = params;
      return token;
    },
    session: (params) => {
      console.debug("session callback", params);
      const { session, token } = params;
      if (token.sub === undefined) {
        throw new Error("No user ID found in JWT token");
      }
      session.user.id = token.sub;
      return session;
    },
  },

  adapter: DrizzleAdapter(db, {
    // @ts-expect-error - Allow nullable email
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,

  providers: [
    CredentialsProvider({
      name: "Guest",
      credentials: {},
      async authorize(_credential, _req) {
        const response = await supabase.auth.signInAnonymously();
        console.debug("signInAnonymously", response);

        if (response.error !== null) {
          console.error(response.error);
          return null;
        }

        if (response.data.user === null) {
          console.error("No data returned from Supabase");
          return null;
        }

        const user: User = response.data.user;

        // TODO: Save the user to the database

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
