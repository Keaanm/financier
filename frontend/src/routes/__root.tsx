import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { type QueryClient } from "@tanstack/react-query";
import { UserType } from "@server/lib/db/schema";

type User = {
  user: Omit<typeof UserType, "id" | "googleId" | "password">;
};

interface MyRouterContext {
  queryClient: QueryClient;
  auth: User | null | undefined;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  },
});
