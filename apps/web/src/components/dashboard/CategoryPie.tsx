"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(280, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(40, 90%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(0, 70%, 50%)",
  "hsl(190, 70%, 50%)",
  "hsl(320, 70%, 50%)",
  "hsl(80, 60%, 45%)",
  "hsl(30, 80%, 50%)",
];

interface CategoryPieProps {
  data: Record<string, number>;
}

export function CategoryPie({ data }: CategoryPieProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-5 pb-2">
          <div className="h-[180px] md:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 px-5 pb-4">
          {chartData.slice(0, 5).map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-[11px] min-w-0">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate min-w-0 max-w-[80px]">{entry.name}</span>
              <span className="text-muted-foreground tabular-nums shrink-0">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
