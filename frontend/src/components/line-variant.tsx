import { format } from "date-fns";
import {
  Tooltip,
  XAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CustomTooltip } from "./custom-tooltip";

type Props = {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

export const LineVariant = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "MMM dd")}
          style={{ fontSize: "12px" }}
        />
        <Tooltip content={CustomTooltip} />
        <Line
          dot={false}
          strokeWidth={2}
          dataKey="income"
          fill="#3d82f6"
          className="drop-shadow-sm"
        />
        <Line
          dot={false}
          strokeWidth={2}
          dataKey="expenses"
          fill="#f43f5e"
          className="drop-shadow-sm"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
