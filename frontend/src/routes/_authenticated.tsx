import Header from "@/components/header";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const SearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  accountId: z.string().optional(),
});

// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_authenticated")({
  // Before loading, authenticate the user via our auth context
  // This will also happen during prefetching (e.g. hovering over links, etc)
  beforeLoad: async ({ location, context }) => {
    if (!context.auth?.user) {
      throw redirect({
        to: "/sign-in",
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
  validateSearch: SearchSchema,
  component: () => (
    <div className="flex flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Outlet />
      </main>
    </div>
  ),
});
