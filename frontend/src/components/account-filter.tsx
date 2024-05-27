import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRouteApi } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useGetSummary } from "@/features/summary/api/use-get-summary";

export const AccountFilter = () => {
  const navigate = useNavigate();

  const routeApi = getRouteApi("/_authenticated");
  const { accountId = "all", from, to } = routeApi.useSearch();
  const { isLoading: isLoadingSummary } = useGetSummary();
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();

  const onChange = (newValue: string) => {
    const query = {
      accountId: newValue,
      from,
      to,
    };
    if (newValue === "all") {
      query.accountId = "";
    }

    navigate({
      search: () => ({
        accountId: query.accountId ? query.accountId : undefined,
        from: query.from,
        to: query.to,
      }),
    });
  };
  return (
    <Select
      value={accountId}
      onValueChange={onChange}
      disabled={isLoadingAccounts || isLoadingSummary}
    >
      <SelectTrigger className="w-full lg:w-auto justify-between font-normal transition-colors hover:text-foreground/80 text-foreground/60 focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none focus:ring-transparent focus:ring-offset-0 focus-visible:ring-0">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
