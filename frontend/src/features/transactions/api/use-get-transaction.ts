import { api } from "@/lib/api";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetTransaction = (id?: string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ["transaction", { id }],
    queryFn: async () => {
      const res = await api.transactions[":id{[a-z0-9]{20,30}}"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch transaction");
      const { data } = await res.json();
      const parsedData = {
        ...data,
        amount: convertAmountFromMiliunits(data.amount),
      };

      return parsedData;
    },
  });
};
