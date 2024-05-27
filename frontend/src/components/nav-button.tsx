import { cn } from "@/lib/utils";
import { getRouteApi } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

type Props = {
  href: string;
  label: string;
  isActive?: boolean;
};
const NavButton = ({ href, label, isActive }: Props) => {
  const routeApi = getRouteApi("/_authenticated");
  const { accountId, from, to } = routeApi.useSearch();
  return (
    <Link
      className={cn(
        "w-full lg:w-auto justify-between font-normal transition-colors hover:text-foreground/80 text-foreground/60",
        isActive ? "text-foreground" : "text-foreground/60"
      )}
      to={href}
      search={{
        from,
        to,
        accountId,
      }}
    >
      {label}
    </Link>
  );
};

export default NavButton;
