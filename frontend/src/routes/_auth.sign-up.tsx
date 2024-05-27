import { createFileRoute, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { AuthForm } from "@/components/auth-form";

const fallback = "/" as const;

export const Route = createFileRoute("/_auth/sign-up")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth?.user) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: SignUpPage,
});

function SignUpPage() {
  const router = useRouter();
  const { data } = useSuspenseQuery(userQueryOptions);
  const search = Route.useSearch();

  useLayoutEffect(() => {
    if (data?.user && search.redirect) {
      router.history.push(search.redirect);
    }
  }, [data, search.redirect]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <AuthForm type="sign-up" />
      </div>
    </div>
  );
}
