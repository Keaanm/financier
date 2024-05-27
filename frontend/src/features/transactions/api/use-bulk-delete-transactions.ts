import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof api.transactions)["bulk-delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof api.transactions)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await api.transactions["bulk-delete"]["$post"]({ json });
      if (!response.ok) throw new Error("Failed to delete transactions");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Tranactions deleted");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to delete transactions");
    },
  });

  return mutation;
};
