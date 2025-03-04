import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  Leaf,
  Droplet,
  Tractor,
  BarChart,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

interface FarmMetricsProps {
  metrics?: MetricCardProps[];
}

const MetricCard = ({
  title,
  value,
  change = 0,
  icon,
  trend = "neutral",
}: MetricCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== 0 && (
          <p className="text-xs flex items-center mt-1">
            {trend === "up" ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : trend === "down" ? (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            ) : null}
            <span
              className={`${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}
            >
              {Math.abs(change)}% from last week
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const FarmMetrics = ({ metrics }: FarmMetricsProps) => {
  const defaultMetrics: MetricCardProps[] = [
    {
      title: "Active Tasks",
      value: 12,
      change: 8,
      trend: "up",
      icon: <Tractor className="h-4 w-4" />,
    },
    {
      title: "Crop Health",
      value: "Good",
      change: 5,
      trend: "up",
      icon: <Leaf className="h-4 w-4" />,
    },
    {
      title: "Water Usage",
      value: "24.5 gal",
      change: -3,
      trend: "down",
      icon: <Droplet className="h-4 w-4" />,
    },
    {
      title: "Harvest Forecast",
      value: "2.4 tons",
      change: 12,
      trend: "up",
      icon: <BarChart className="h-4 w-4" />,
    },
  ];

  const displayMetrics = metrics || defaultMetrics;

  return (
    <div className="w-full bg-background p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Farm Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default FarmMetrics;
