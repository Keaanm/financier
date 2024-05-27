import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEditUser, userQueryOptions } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { FieldInfo } from "@/components/form-field.info";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

function Settings() {
  const { data: user } = useSuspenseQuery(userQueryOptions);
  const editUser = useEditUser();

  const form = useForm({
    defaultValues: {
      name: user?.user.name ?? "",
    },
    onSubmit: async ({ value }) => {
      editUser.mutate(value);
    },
    validatorAdapter: zodValidator,
  });

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <div className="mx-auto grid w-full max-w-7xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-7xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
          x-chunk="dashboard-04-chunk-0"
        >
          <Link href="#" className="font-semibold text-primary">
            General
          </Link>
          <Link href="#">Integrations</Link>
          <Link href="#">Billing</Link>
          <Link href="#">Advanced</Link>
        </nav>
        <div className="grid gap-6">
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={user?.user.email ?? ""} disabled />
                </div>

                <form.Field
                  name="name"
                  validators={{
                    onChange: z
                      .string()
                      .min(1, {
                        message: "Name is required",
                      })
                      .max(255),
                  }}
                  children={(field) => (
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor={field.name}>Name</Label>
                      </div>
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
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, editUser.isPending]}
                  children={([canSubmit, isPending]) => (
                    <Button type="submit" disabled={!canSubmit}>
                      {isPending ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="animate-spin mr-2" /> Saving...
                        </span>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  )}
                />
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
