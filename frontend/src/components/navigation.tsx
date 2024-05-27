import { useNavigate, useRouterState } from "@tanstack/react-router";
import NavButton from "./nav-button";
import { useMedia } from "react-use";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";

const routes = [
  {
    href: "/",
    label: "Overview",
  },
  {
    href: "/transactions",
    label: "Transactions",
  },
  {
    href: "/categories",
    label: "Categories",
  },
  {
    href: "/accounts",
    label: "Accounts",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const routerState = useRouterState();
  const routeApi = getRouteApi("/_authenticated");
  const { accountId, from, to } = routeApi.useSearch();

  const navigate = useNavigate({ from: routerState.location.pathname });
  const isMobile = useMedia("(max-width: 1024px)", false);

  const pathname = routerState.location.pathname;

  const onClick = (href: string) => {
    navigate({
      to: href,
      search: {
        from,
        to,
        accountId,
      },
    });
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="font-normal bg-primary/5 hover:bg-primary/10 hover:text-primary text-primary focus:bg-primary/30 dark:bg-white/10 dark:hover:bg-white/20 dark:hover:text-white dark:text-white dark:focus:bg-white/30 border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none transition"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2">
          <nav className="flex flex-col gap-y-2 pt-6">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.href === pathname ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onClick(route.href)}
              >
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <nav className="hidden lg:flex items-center gap-4 text-sm lg:gap-6">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={route.href}
          label={route.label}
          isActive={routerState.location.pathname === route.href}
        />
      ))}
    </nav>
  );
};

export default Navigation;
