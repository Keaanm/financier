import {
  Lucia,
  generateIdFromEntropySize,
  type Session,
  type User,
} from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db/index.js";
import { eq } from "drizzle-orm";
import {
  passwordResetTokenTable,
  sessionTable,
  userTable,
} from "./db/schema.js";
import { createMiddleware } from "hono/factory";
import { UserType } from "./db/schema.js";
import { HTTPException } from "hono/http-exception";
import { TimeSpan, createDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      profileImage: attributes.profileImage,
      name: attributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<typeof UserType, "id" | "googleId">;
  }
}

type Env = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const getUser = createMiddleware<Env>(async (c, next) => {
  if (!c.var.session || !c.var.user) {
    const errorResponse = Response.json(
      {
        error: "unauthorized",
      },
      { status: 401 }
    );
    throw new HTTPException(401, { res: errorResponse });
  }
  return next();
});

export async function createPasswordResetToken(
  userId: string
): Promise<string> {
  // optionally invalidate all existing tokens
  await db
    .delete(passwordResetTokenTable)
    .where(eq(passwordResetTokenTable.userId, userId));

  const tokenId = generateIdFromEntropySize(25); // 40 character
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));
  await db.insert(passwordResetTokenTable).values({
    tokenHash: tokenHash,
    userId: userId,
    expiresAt: createDate(new TimeSpan(2, "h")),
  });
  return tokenId;
}
