import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { SignInSchema, SignUpSchema } from "@server/sharedTypes";
import { api } from "@/lib/api";
import { FieldInfo } from "@/components/form-field.info";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  type: "sign-in" | "sign-up";
};

export const AuthForm = ({ type }: Props) => {
  const [backendError, setBackendError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        console.log(value);
        if (type === "sign-up") {
          const res = await api["sign-up"].$post({
            json: {
              email: value.email,
              password: value.password,
            },
          });
          if (!res.ok) {
            form.reset();
            if (res.status === 429) {
              setBackendError("Too many requests, try again later");
              return;
            }
            setBackendError("Incorrect email or password");
          } else {
            window.location.reload();
          }
        } else {
          const res = await api["sign-in"].$post({
            json: {
              email: value.email,
              password: value.password,
            },
          });
          if (!res.ok) {
            form.reset();
            if (res.status === 429) {
              setBackendError("Too many requests, try again later");
              return;
            }
            setBackendError("Incorrect email or password");
          } else {
            window.location.reload();
          }
        }
      } catch (error: any) {
        console.log("An error has occured: " + error?.message);
        setBackendError(error?.message);
      }
    },
    validatorAdapter: zodValidator,
  });

  return (
    <>
      {backendError ? (
        <p className="text-destructive text-center">{backendError}</p>
      ) : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="grid gap-4"
      >
        <form.Field
          name="email"
          validators={{
            onChange:
              type === "sign-in"
                ? SignInSchema.shape.email
                : SignUpSchema.shape.email,
            onChangeAsyncDebounceMs: 500,
          }}
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
        <form.Field
          name="password"
          validators={{
            onChange:
              type === "sign-in"
                ? SignInSchema.shape.password
                : SignUpSchema.shape.password,
          }}
          children={(field) => (
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor={field.name}>Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button className="w-full" type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin mr-2" />{" "}
                  {type === "sign-in" ? "Signing in" : "Signing up"}
                </span>
              ) : type === "sign-in" ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </Button>
          )}
        />

        <a
          href="/api/google"
          className={cn(
            "w-full",
            buttonVariants({
              variant: "outline",
            })
          )}
        >
          Login with Google
        </a>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          to={type === "sign-in" ? "/sign-up" : "/sign-in"}
          className="underline"
        >
          {type === "sign-in" ? "Sign up" : "Sign in"}
        </Link>
      </div>
    </>
  );
};
