import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../schema";
import { accounts, sessions, users, verificationTokens } from "../schema/table";
import { randomUUID } from "crypto";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      users,
      sessions,
      accounts,
      verificationTokens,
    },
  }),
  advanced: {
    cookiePrefix: "mixpense",
    generateId: () => randomUUID(),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
});
