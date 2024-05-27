import { InferRequestType, InferResponseType, hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

const client = hc<ApiRoutes>("/");

export const api = client.api;

async function getCurrentUser() {
  const res = await api.me.$get();
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) throw new Error("Failed to fetch user");
  return await res.json();
}

export const userQueryOptions = queryOptions({
  queryKey: ["currentUser"],
  queryFn: getCurrentUser,
  staleTime: Infinity,
});

type ResponseType = InferResponseType<typeof api.me.$patch, 200>;
type RequestType = InferRequestType<typeof api.me.$patch>["json"];

export const useEditUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await api.me.$patch({ json });
      if (!response.ok) throw new Error("Failed to create account");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account info updated");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      toast.error("Failed to update account info");
    },
  });

  return mutation;
};
