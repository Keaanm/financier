import { api } from "@/lib/api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const accountsQueryOptions = queryOptions({
  queryKey: ["accounts"],
  queryFn: async () => {
    const res = await api.accounts.$get();
    if (!res.ok) throw new Error("Failed to fetch accounts");
    const { data } = await res.json();
    return data;
  },
});

export const useGetAccounts = () => {
  return useQuery(accountsQueryOptions);
};
