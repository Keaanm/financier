import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { SignInSchema } from "@server/sharedTypes";
import { api, userQueryOptions } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { FieldInfo } from "@/components/form-field.info";

const fallback = "/" as const;

export const Route = createFileRoute("/_auth/forgot-password")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth?.user) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const router = useRouter();
  const { data } = useSuspenseQuery(userQueryOptions);
  const search = Route.useSearch();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (data?.user && search.redirect) {
      router.history.push(search.redirect);
    }
  }, [data, search.redirect]);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        console.log(value);
        const res = await api["reset-password"].$post({
          json: {
            email: value.email,
          },
        });
        if (res.status === 429) {
          setBackendError("Too many requests, try again later");
          return;
        } else if (!res.ok) {
          setPasswordStatus(
            "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes."
          );
        } else {
          setPasswordStatus(
            "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes."
          );
        }
      } catch (error: any) {
        console.log("An error has occured: " + error?.message);
        setBackendError("Failed to send reset password email.");
      }
    },
    validatorAdapter: zodValidator,
  });

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Forgot password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to sign back in.
          </p>
        </div>
        {backendError ? (
          <p className="font-medium text-destructive text-center">
            {backendError}
          </p>
        ) : null}
        {passwordStatus && (
          <p className="font-medium text-center text-sky-500">
            {passwordStatus}
          </p>
        )}
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
              onChange: SignInSchema.shape.email,
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button className="w-full" type="submit" disabled={!canSubmit}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin mr-2" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}
