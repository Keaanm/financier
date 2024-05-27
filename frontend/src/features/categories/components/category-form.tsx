import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import type { FieldApi } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { CategorySchema } from "@server/sharedTypes";

type FormValues = z.input<typeof CategorySchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.touchedErrors ? (
        <em className="text-destructive">{field.state.meta.touchedErrors}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export const CategoryForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const form = useForm({
    defaultValues: defaultValues ?? { name: "" },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
    validatorAdapter: zodValidator,
  });

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 pt-4"
    >
      <form.Field
        name="name"
        validators={{
          onChange: CategorySchema.shape.name,
          onChangeAsyncDebounceMs: 500,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Name</Label>
            <Input
              disabled={disabled}
              placeholder="e.g. Food, Travel, etc."
              id={field.name}
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
          <Button
            className="w-full"
            type="submit"
            disabled={!canSubmit || disabled}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin mr-2" /> Creating category...
              </span>
            ) : id ? (
              "Save changes"
            ) : (
              "Create category"
            )}
          </Button>
        )}
      />
      {!!id && (
        <Button
          variant="outline"
          onClick={handleDelete}
          className="w-full"
          type="button"
          disabled={disabled}
        >
          <Trash className="size-4 mr-2" />
          Delete category
        </Button>
      )}
    </form>
  );
};
