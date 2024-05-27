import { api } from "@/lib/api";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

export const useGetSummary = () => {
  const routeApi = getRouteApi("/_authenticated");
  const { accountId, from, to } = routeApi.useSearch();

  return useQuery({
    // check if params are needed in key
    queryKey: ["summary", { from, to, accountId }],
    queryFn: async () => {
      const res = await api.summary.$get({
        query: {
          from,
          to,
          accountId,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch summaries");
      const { data } = await res.json();
      return {
        ...data,
        incomeAmount: convertAmountFromMiliunits(data.incomeAmount),
        expensesAmount: convertAmountFromMiliunits(data.expensesAmount),
        categories: data.categories.map((category) => ({
          ...category,
          value: convertAmountFromMiliunits(category.value),
        })),
        days: data.days.map((day) => ({
          ...day,
          income: convertAmountFromMiliunits(day.income),
          expenses: convertAmountFromMiliunits(day.expenses),
        })),
      };
    },
  });
};
