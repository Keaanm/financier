import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof api.transactions)[":id{[a-z0-9]{20,30}}"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof api.transactions)[":id{[a-z0-9]{20,30}}"]["$patch"]
>["json"];

export const useEditTransaction = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await api.transactions[":id{[a-z0-9]{20,30}}"]["$patch"](
        {
          json,
          param: { id: id },
        }
      );
      if (!response.ok) throw new Error("Failed to edit transaction");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transaction updated");
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", { id }] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (err) => {
      console.log(err);
      toast.error("Failed to update transaction");
    },
  });

  return mutation;
};
