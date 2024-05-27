import { api } from "@/lib/api";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

export const useGetTransactions = () => {
  const routeApi = getRouteApi("/_authenticated");
  const { accountId, from, to } = routeApi.useSearch();

  return useQuery({
    // check if params are needed in key
    queryKey: ["transactions", { from, to, accountId }],
    queryFn: async () => {
      const res = await api.transactions.$get({
        query: {
          from,
          to,
          accountId,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch transactions");
      const { data } = await res.json();
      return data.map((transaction) => ({
        ...transaction,
        amount: convertAmountFromMiliunits(transaction.amount),
      }));
    },
  });
};
