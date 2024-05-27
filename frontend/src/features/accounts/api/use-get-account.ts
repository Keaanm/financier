import { api } from "@/lib/api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const accountQueryOptions = queryOptions({
  queryKey: ["accounts"],
  queryFn: async () => {
    const res = await api.accounts.$get();
    if (!res.ok) throw new Error("Failed to fetch accounts");
    const { data } = await res.json();
    return data;
  },
});

export const useGetAccount = (id?: string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ["account", { id }],
    queryFn: async () => {
      const res = await api.accounts[":id{[a-z0-9]{20,30}}"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch account");
      const { data } = await res.json();
      return data;
    },
  });
};
