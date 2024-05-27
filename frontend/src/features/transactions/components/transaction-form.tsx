import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import type { FieldApi } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { TransactionSchema } from "@server/sharedTypes";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "@/components/select";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { AmountInput } from "@/components/amount-input";
import { convertAmountToMiliunits } from "@/lib/utils";

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof TransactionSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  onCreateAccount: (name: string) => void;
  onCreateCategory: (name: string) => void;
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

export const TransactionForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      const amountInMiliunits = convertAmountToMiliunits(
        parseFloat(value.amount)
      );
      onSubmit({
        ...value,
        amount: amountInMiliunits,
      });
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
        name="date"
        validators={{
          onChange: formSchema.shape.date,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <DatePicker
              value={field.state.value}
              onChange={(date) => field.handleChange(date!)}
              disabled={disabled}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Field
        name="accountId"
        validators={{
          onChange: formSchema.shape.accountId,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Account</Label>
            <Select
              placeholder="Select an account"
              options={accountOptions}
              value={field.state.value}
              onChange={(event) => field.handleChange(event || "")}
              onCreate={onCreateAccount}
              disabled={disabled}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Field
        name="categoryId"
        validators={{
          onChange: formSchema.shape.categoryId,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Category</Label>
            <Select
              placeholder="Select an category"
              options={categoryOptions}
              value={field.state.value}
              onChange={(event) => field.handleChange(event || "")}
              onCreate={onCreateCategory}
              disabled={disabled}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Field
        name="payee"
        validators={{
          onChange: formSchema.shape.payee,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Payee</Label>
            <Input
              disabled={disabled}
              placeholder="Add a payee"
              id={field.name}
              name={field.name}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Field
        name="amount"
        validators={{
          onChange: formSchema.shape.amount,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Amount</Label>
            <AmountInput
              disabled={disabled}
              placeholder="0.00"
              value={field.state.value}
              onChange={(value) => field.handleChange(value ?? "")}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Field
        name="notes"
        validators={{
          onChange: formSchema.shape.notes,
        }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Notes</Label>
            <Textarea
              disabled={disabled}
              placeholder="Optional notes"
              id={field.name}
              name={field.name}
              value={field.state.value ?? ""}
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
                <Loader2 className="animate-spin mr-2" /> Creating
                transaction...
              </span>
            ) : id ? (
              "Save changes"
            ) : (
              "Create transaction"
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
          Delete transaction
        </Button>
      )}
    </form>
  );
};
