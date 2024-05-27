import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof api.accounts)[":id{[a-z0-9]{20,30}}"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof api.accounts)[":id{[a-z0-9]{20,30}}"]["$patch"]
>["json"];

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await api.accounts[":id{[a-z0-9]{20,30}}"]["$patch"]({
        json,
        param: { id: id },
      });
      if (!response.ok) throw new Error("Failed to edit account");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account updated");
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to update account");
    },
  });

  return mutation;
};
