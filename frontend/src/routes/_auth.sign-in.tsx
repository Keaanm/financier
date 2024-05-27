import { createFileRoute, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { AuthForm } from "@/components/auth-form";

const fallback = "/" as const;

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth?.user) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: SignInPage,
});

function SignInPage() {
  const router = useRouter();
  const { data: userData } = useSuspenseQuery(userQueryOptions);
  const search = Route.useSearch();

  useLayoutEffect(() => {
    if (userData?.user && search.redirect) {
      router.history.push(search.redirect);
    }
  }, [userData, search.redirect]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <AuthForm type="sign-in" />
      </div>
    </div>
  );
}
