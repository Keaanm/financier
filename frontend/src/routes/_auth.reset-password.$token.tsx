import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { SignUpSchema } from "@server/sharedTypes";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { FieldInfo } from "@/components/form-field.info";

export const Route = createFileRoute("/_auth/reset-password/$token")({
  component: ForgotPasswordPageReset,
});

function ForgotPasswordPageReset() {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const params = Route.useParams();
  const [backendError, setBackendError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        console.log(value);
        const res = await api["reset-password"][":token"].$post({
          param: {
            token: params.token,
          },
          json: {
            password: value.password,
          },
        });
        if (!res.ok) {
          setBackendError("An error occured trying to reset your password.");
        } else {
          await queryClient.invalidateQueries({
            queryKey: ["currentUser"],
          });
          router.invalidate().finally(() => {
            navigate({ to: "/" });
          });
        }
      } catch (error: any) {
        console.log("An error has occured: " + error?.message);
        setBackendError(
          "Failed to reset your password. Please try again later."
        );
      }
    },
    validatorAdapter: zodValidator,
  });

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your new password
          </p>
        </div>
        {backendError ? (
          <p className="text-destructive text-center">{backendError}</p>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          <form.Field
            name="password"
            validators={{
              onChange: SignUpSchema.shape.password,
            }}
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button className="w-full" type="submit" disabled={!canSubmit}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin mr-2" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}
