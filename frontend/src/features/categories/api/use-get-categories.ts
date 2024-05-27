import { api } from "@/lib/api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const res = await api.categories.$get();
    if (!res.ok) throw new Error("Failed to fetch categories");
    const { data } = await res.json();
    return data;
  },
});

export const useGetCategories = () => {
  return useQuery(categoriesQueryOptions);
};
