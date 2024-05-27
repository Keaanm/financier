import { DataCard, DataCardLoading } from "@/components/data-card";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { formatDateRange } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { DataCharts } from "@/components/data-charts";

const SearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  accountId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
  validateSearch: (search) => SearchSchema.parse(search),
});

function Index() {
  const { from, to } = Route.useSearch();
  const { data, isLoading } = useGetSummary();
  const dateRangeLabel = formatDateRange({ from, to });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto pb-10 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCard
          title="Remaining"
          value={data?.remainingAmount}
          percentageChange={data?.remainingAmount}
          icon={FaPiggyBank}
          variant="default"
          dateRange={dateRangeLabel}
        />
        <DataCard
          title="Income"
          value={data?.incomeAmount}
          percentageChange={data?.incomeChange}
          icon={FaArrowTrendUp}
          variant="default"
          dateRange={dateRangeLabel}
        />
        <DataCard
          title="Expenses"
          value={data?.expensesAmount}
          percentageChange={data?.expensesChange}
          icon={FaArrowTrendDown}
          variant="default"
          dateRange={dateRangeLabel}
        />
      </div>
      <DataCharts />
    </div>
  );
}
