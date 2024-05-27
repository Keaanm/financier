import { api } from "@/lib/api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const categoryQueryOptions = queryOptions({
  queryKey: ["category"],
  queryFn: async () => {
    const res = await api.categories.$get();
    if (!res.ok) throw new Error("Failed to fetch category");
    const { data } = await res.json();
    return data;
  },
});

export const useGetCategory = (id?: string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ["category", { id }],
    queryFn: async () => {
      const res = await api.categories[":id{[a-z0-9]{20,30}}"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch category");
      const { data } = await res.json();
      return data;
    },
  });
};
