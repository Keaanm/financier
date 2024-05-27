import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createPasswordResetToken, lucia } from "../lib/auth.js";
import { generateId, generateIdFromEntropySize } from "lucia";
import {
  insertUserSchema,
  passwordResetTokenTable,
  userTable,
} from "../lib/db/schema.js";
import { SignInSchema, SignUpSchema } from "../sharedTypes.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Resend } from "resend";
import { isWithinExpirationDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";
import { hash } from "@node-rs/argon2";
import { Google, OAuth2RequestError, generateCodeVerifier } from "arctic";
import { generateState } from "arctic";
import { getCookie, setCookie } from "hono/cookie";
import { rateLimiter } from "hono-rate-limiter";

const resend = new Resend("re_VXwSv2uZ_51E9UtLhyfdC4oJQKu6Rr1qu");
const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.URL ?? "http://localhost:5173"}/api/google/callback`
);

const strongestRateLimit = rateLimiter({
  windowMs: 60 * 1000 * 2,
  limit: 5 * 1,
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => c.env?.ip?.address! as string,
});

export const authRoutes = new Hono()
  .post(
    "/sign-in",
    strongestRateLimit,
    zValidator("json", SignInSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const [existingUser] = await c.var.db
          .select()
          .from(userTable)
          .where(eq(userTable.email, body.email))
          .limit(1);
        if (!existingUser.email || !existingUser.password) {
          return c.json(
            {
              error: "Incorrect email or password",
            },
            400
          );
        }
        const validPassword = await Bun.password.verify(
          body.password,
          existingUser.password
        );
        if (!validPassword) {
          return c.json(
            {
              error: "Incorrect email or password",
            },
            400
          );
        }
        const session = await lucia.createSession(existingUser.id, {
          email: body.email,
        });
        c.header(
          "Set-Cookie",
          lucia.createSessionCookie(session.id).serialize()
        );
        return c.redirect("/");
      } catch (error) {
        console.log("An error occured trying to sign user in: " + error);
        return c.json(
          {
            error: "Incorrect email or password",
          },
          500
        );
      }
    }
  )
  .post(
    "/sign-up",
    strongestRateLimit,
    zValidator("json", SignUpSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const hashedPassword = await Bun.password.hash(body.password, {
          algorithm: "argon2id", // "argon2id" | "argon2i" | "argon2d"
          memoryCost: 19456,
          timeCost: 2, // the number of iterations
        });
        const userId = generateId(15);

        const validatedData = insertUserSchema.parse({
          id: userId,
          email: body.email,
          password: hashedPassword,
        });

        await c.var.db.insert(userTable).values(validatedData);

        const session = await lucia.createSession(userId, {
          email: body.email,
        });

        c.header(
          "Set-Cookie",
          lucia.createSessionCookie(session.id).serialize()
        );

        return c.redirect("/");
      } catch (error) {
        console.log("An error occurred trying to sign user up: " + error);
        return c.json(
          {
            error: "Unable to register with the provided email or password.",
          },
          500
        );
      }
    }
  )
  .post("/sign-out", async (c) => {
    const session = c.var.session;
    if (!session) {
      return c.redirect("/sign-in");
    }
    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize());
    return c.redirect("/sign-in");
  })
  .post(
    "/reset-password",
    strongestRateLimit,
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
      })
    ),
    async (c) => {
      const { email } = c.req.valid("json");

      const [user] = await c.var.db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);
      if (!user) {
        return c.json({ message: "Invalid Email" }, 400);
      }
      const verificationToken = await createPasswordResetToken(user.id);
      const verificationLink = `${
        process.env.URL ?? "http://localhost:5173/reset-password/"
      }${verificationToken}`;

      resend.emails.send({
        from: "financier@resend.dev",
        to: user.email,
        subject: "Password Reset",
        html: `Link: <a href="${verificationLink}">Reset Link</a>`,
      });
      return c.newResponse(null, 200);
    }
  )
  .post(
    "/reset-password/:token",
    strongestRateLimit,
    zValidator("param", z.object({ token: z.string() })),
    zValidator(
      "json",
      z.object({
        password: SignInSchema.shape.password,
      })
    ),
    async (c) => {
      const { token: verificationToken } = c.req.valid("param");
      const { password } = c.req.valid("json");

      const tokenHash = encodeHex(
        await sha256(new TextEncoder().encode(verificationToken))
      );
      const [token] = await c.var.db
        .select()
        .from(passwordResetTokenTable)
        .where(eq(passwordResetTokenTable.tokenHash, tokenHash));
      if (token) {
        await c.var.db
          .delete(passwordResetTokenTable)
          .where(eq(passwordResetTokenTable.tokenHash, tokenHash));
      }

      if (!token || !isWithinExpirationDate(token.expiresAt)) {
        return c.newResponse(null, {
          status: 400,
        });
      }

      await lucia.invalidateUserSessions(token.userId);

      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      const [user] = await c.var.db
        .update(userTable)
        .set({
          password: passwordHash,
        })
        .where(eq(userTable.id, token.userId))
        .returning();

      const session = await lucia.createSession(token.userId, {
        email: user.email,
      });
      const sessionCookie = lucia.createSessionCookie(session.id);

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
          "Referrer-Policy": "no-referrer",
        },
      });
    }
  )
  .get("/me", async (c) => {
    if (!c.var.user) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }
    return c.json(
      {
        user: c.var.user,
      },
      200
    );
  })
  .patch(
    "/me",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(255),
      })
    ),
    async (c) => {
      if (!c.var.user) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }
      const { name } = c.req.valid("json");
      const [data] = await c.var.db
        .update(userTable)
        .set({
          name,
        })
        .where(eq(userTable.id, c.var.user.id))
        .returning({ name: userTable.name });
      if (!data) {
        return c.json({ error: "User not found" }, 404);
      }
      return c.json({ data });
    }
  )
  .get("/google", async (c) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ["email", "profile"],
    });

    setCookie(c, "google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
      sameSite: "Lax",
    });

    //find out why it is secure when I am not in production

    setCookie(c, "code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
      sameSite: "Lax",
    });

    return c.redirect(url.toString());
  })
  .get("/google/callback", async (c) => {
    const allCookies = getCookie(c);
    console.log("allCookies", allCookies);

    const stateCookie = getCookie(c, "google_oauth_state") ?? null;
    console.log("storedState", stateCookie);

    const codeVerifier = getCookie(c, "code_verifier") ?? null;
    console.log("codeVerifier", codeVerifier);

    const url = new URL(c.req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (
      !code ||
      !state ||
      !stateCookie ||
      state !== stateCookie ||
      !codeVerifier
    ) {
      console.error("Invalid state or code");
      return c.json({ error: "Invalid request" }, 400);
    }

    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const googleUserResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      if (!googleUserResponse.ok) {
        return c.json({ error: "Failed to fetch" }, 500);
      }
      const googleUser: GoogleUser = await googleUserResponse.json();

      const [existingUser] = await c.var.db
        .select()
        .from(userTable)
        .where(eq(userTable.googleId, googleUser.sub));

      if (existingUser) {
        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        c.header("Set-Cookie", sessionCookie.serialize());
        return c.redirect("/");
      }

      const userId = generateIdFromEntropySize(10); // 16 characters long

      await c.var.db.insert(userTable).values({
        id: userId,
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        profileImage: googleUser.picture,
      });

      const session = await lucia.createSession(userId, {
        email: googleUser.email,
      });
      const sessionCookie = lucia.createSessionCookie(session.id);
      c.header("Set-Cookie", sessionCookie.serialize());
      return c.redirect("/");
    } catch (e) {
      console.error(e);
      if (e instanceof OAuth2RequestError) {
        c.json({ error: "Invalid code" }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

interface GoogleUser {
  sub: string; // Unique identifier for the user
  email: string; // User's email address
  email_verified: boolean; // Whether the user's email is verified
  name: string; // Full name of the user
  given_name: string; // First name of the user
  family_name: string; // Last name of the user
  picture: string; // URL of the user's profile picture
  locale: string; // User's locale
}
