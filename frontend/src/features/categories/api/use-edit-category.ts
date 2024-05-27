import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof api.categories)[":id{[a-z0-9]{20,30}}"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof api.categories)[":id{[a-z0-9]{20,30}}"]["$patch"]
>["json"];

export const useEditCategory = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await api.categories[":id{[a-z0-9]{20,30}}"]["$patch"]({
        json,
        param: { id: id },
      });
      if (!response.ok) throw new Error("Failed to edit category");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("category updated");
      queryClient.invalidateQueries({ queryKey: ["category", { id }] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  return mutation;
};
