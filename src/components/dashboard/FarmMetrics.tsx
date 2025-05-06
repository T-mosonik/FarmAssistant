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
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="text-lg sm:text-xl md:text-2xl font-bold">{value}</div>
        {change !== 0 && (
          <p className="text-[10px] sm:text-xs flex items-center mt-0.5 sm:mt-1">
            {trend === "up" ? (
              <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 mr-0.5 sm:mr-1" />
            ) : trend === "down" ? (
              <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 mr-0.5 sm:mr-1" />
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
      icon: <Tractor className="h-3 w-3 sm:h-4 sm:w-4" />,
    },
    {
      title: "Crop Health",
      value: "Good",
      change: 5,
      trend: "up",
      icon: <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />,
    },
    {
      title: "Water Usage",
      value: "24.5 gal",
      change: -3,
      trend: "down",
      icon: <Droplet className="h-3 w-3 sm:h-4 sm:w-4" />,
    },
    {
      title: "Harvest Forecast",
      value: "2.4 tons",
      change: 12,
      trend: "up",
      icon: <BarChart className="h-3 w-3 sm:h-4 sm:w-4" />,
    },
  ];

  const displayMetrics = metrics || defaultMetrics;

  return (
    <div className="w-full bg-background p-2 sm:p-3 md:p-4 rounded-lg">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">
        Farm Metrics
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {displayMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default FarmMetrics;
