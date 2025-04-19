"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const SalesChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        className="size-full bg-primary/10 rounded-2xl"
        data={data}
        margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
      >
        <Line type="monotone" dataKey="sales" stroke="#00ABB3" />
        <CartesianGrid stroke="#00ABB3" strokeDasharray="5 5" />
        <XAxis dataKey="name" className="bg-primary/50" />
        <YAxis className="bg-primary/50" />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
