import { AccountFilter } from "./account-filter";
import { DateFilter } from "./date-filter";

export const Filters = () => {
  return (
    <div className="flex items-center gap-2">
      <AccountFilter />
      <DateFilter />
    </div>
  );
};
