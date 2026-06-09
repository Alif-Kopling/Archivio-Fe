import { FC, useMemo } from "react";
import { Card, Chip } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { FileBarChart } from "lucide-react";

export interface TrendItem {
  month: string;
  masuk: number;
  keluar: number;
  sertifikat: number;
  total: number;
}

const CHART_COLORS = {
  masuk: "#3b82f6",
  keluar: "#8b5cf6",
  sertifikat: "#f59e0b",
};

const formatMonth = (m: string) => {
  const [, mm] = m.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  return months[parseInt(mm, 10) - 1] || m;
};

const TrendsChart: FC<{ data: TrendItem[] }> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      monthLabel: formatMonth(d.month),
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="border-divider shadow-sm flex flex-col h-full">
        <Card.Content className="p-3 flex flex-col h-full justify-center items-center">
          <FileBarChart className="text-default-300 mb-2" size={24} />
          <p className="text-xs text-default-400">No trend data yet</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="border-divider shadow-sm flex flex-col h-full">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-primary/10 text-primary">
              <FileBarChart size={14} />
            </div>
            <h4 className="font-bold text-xs">
              Trends {new Date().getFullYear()}
            </h4>
          </div>
          <Chip
            className="h-4 text-[9px]"
            color="default"
            size="sm"
            variant="soft"
          >
            By Type
          </Chip>
        </div>

        <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              barCategoryGap="20%"
              data={chartData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                stroke="hsl(var(--heroui-default-200))"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="monthLabel"
                tick={{ className: "fill-default-500", fontSize: 9 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ className: "fill-default-500", fontSize: 9 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid hsl(var(--heroui-default-200))",
                  background: "hsl(var(--heroui-background))",
                }}
                cursor={{
                  fill: "hsl(var(--heroui-default-100))",
                  opacity: 0.5,
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-[10px] text-default-500">{value}</span>
                )}
                iconSize={8}
                iconType="circle"
              />
              <Bar
                dataKey="masuk"
                fill={CHART_COLORS.masuk}
                name="Surat Masuk"
                radius={[0, 0, 0, 0]}
                stackId="type"
              />
              <Bar
                dataKey="keluar"
                fill={CHART_COLORS.keluar}
                name="Surat Keluar"
                radius={[0, 0, 0, 0]}
                stackId="type"
              />
              <Bar
                dataKey="sertifikat"
                fill={CHART_COLORS.sertifikat}
                name="Sertifikat"
                radius={[4, 4, 0, 0]}
                stackId="type"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3 mt-2 pt-2 border-t border-divider shrink-0">
          {[
            {
              label: "Masuk",
              key: "masuk" as const,
              color: CHART_COLORS.masuk,
            },
            {
              label: "Keluar",
              key: "keluar" as const,
              color: CHART_COLORS.keluar,
            },
            {
              label: "Sertifikat",
              key: "sertifikat" as const,
              color: CHART_COLORS.sertifikat,
            },
          ].map(({ label, key, color }) => {
            const total = data.reduce((s, d) => s + d[key], 0);

            return (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[9px] font-semibold text-default-500">
                  {label}
                </span>
                <span className="text-[9px] font-bold text-foreground tabular-nums">
                  {total}
                </span>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
};

export default TrendsChart;
