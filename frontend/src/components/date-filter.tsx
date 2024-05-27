import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { ChevronDown } from "lucide-react";
import { formatDateRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { useNavigate } from "@tanstack/react-router";

export const DateFilter = () => {
  const navigate = useNavigate();

  const routeApi = getRouteApi("/_authenticated");
  const { accountId, from, to } = routeApi.useSearch();

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  };

  const [date, setDate] = useState<DateRange | undefined>(paramState);

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query = {
      from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
      to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
      accountId: accountId || "all",
    };

    navigate({
      search: () => ({
        from: query.from,
        to: query.to,
        accountId,
      }),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="w-full lg:w-auto justify-between font-normal transition-colors hover:text-foreground/80 text-foreground/60 hover:bg-background/10 focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none focus:ring-transparent focus:ring-offset-0 focus-visible:ring-0"
        >
          <span>{formatDateRange(paramState)}</span>
          <ChevronDown className="ml-2 size-4 opaticy-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="lg:w-auto w-full p-0" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setDate({
                  from: defaultFrom,
                  to: defaultTo,
                });
                pushToUrl({ from: defaultFrom, to: defaultTo });
              }}
              disabled={!date?.from || !date?.to}
              className="w-full"
            >
              Reset
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={() => pushToUrl(date)}
              disabled={!date?.from || !date?.to}
              className="w-full"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};
