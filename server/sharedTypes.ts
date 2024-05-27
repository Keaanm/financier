import { z } from "zod";
import {
  insertAccountSchema,
  insertCategorySchema,
  insertTransactionSchema,
  insertUserSchema,
} from "./lib/db/schema";

export const SignInSchema = insertUserSchema
  .omit({
    id: true,
  })
  .extend({
    password: z
      .string()
      .min(8, {
        message: "Your password must be at least 8 characters",
      })
      .max(255),
  });

export const SignUpSchema = insertUserSchema
  .omit({
    id: true,
  })
  .extend({
    password: z
      .string()
      .min(8, {
        message: "Your password must be at least 8 characters",
      })
      .max(255)
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/,
        {
          message:
            "Your password must contain at least one uppercase letter, one number, and one special character",
        }
      ),
  });

export const AccountSchema = insertAccountSchema.pick({
  name: true,
});

export const CategorySchema = insertCategorySchema.pick({
  name: true,
});

export const TransactionSchema = insertTransactionSchema.omit({
  id: true,
});
