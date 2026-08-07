import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function ChartCard({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-soft p-5"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </motion.section>
  );
}

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.75rem",
    color: "var(--color-popover-foreground)",
    fontSize: "12px",
  },
};

export function TrendArea({
  data,
  dataKey,
  color = "var(--color-chart-1)",
  unit,
}: {
  data: object[];
  dataKey: string;
  color?: string;
  unit?: string;
}) {
  const gid = `grad-${dataKey}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} {...(unit ? { unit } : {})} width={52} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gid})`}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLines({
  data,
  series,
}: {
  data: object[];
  series: { key: string; color: string; name: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={52} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendBars({
  data,
  series,
  stacked = false,
}: {
  data: object[];
  series: { key: string; color: string; name: string }[];
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={12} />
        <YAxis {...axisProps} width={52} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            radius={[6, 6, 0, 0]}
            {...(stacked ? { stackId: "a" } : {})}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
