import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Truck, Loader2 } from "lucide-react";
import { InputItem } from "./InputDetails";
import { OutputItem } from "./OutputDetails";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface InventoryChartsProps {
  inputs: InputItem[];
  outputs: OutputItem[];
}

const InventoryCharts: React.FC<InventoryChartsProps> = ({
  inputs: initialInputs,
  outputs: initialOutputs,
}) => {
  const [inputs, setInputs] = useState<InputItem[]>(initialInputs);
  const [outputs, setOutputs] = useState<OutputItem[]>(initialOutputs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Just use the initial data from props instead of trying to fetch from Supabase
    // This avoids the error when tables don't exist yet
    setInputs(initialInputs);
    setOutputs(initialOutputs);
    setLoading(false);
  }, [initialInputs, initialOutputs]);

  // Process data for charts
  // Group inputs by category
  const inputsByCategory = inputs.reduce(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, InputItem[]>,
  );

  // Group outputs by category
  const outputsByCategory = outputs.reduce(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, OutputItem[]>,
  );

  // Calculate total quantities by category
  const inputTotals = Object.entries(inputsByCategory).map(
    ([category, items]) => ({
      category,
      total: items.reduce((sum, item) => sum + item.quantity, 0),
      count: items.length,
    }),
  );

  const outputTotals = Object.entries(outputsByCategory).map(
    ([category, items]) => ({
      category,
      total: items.reduce((sum, item) => sum + item.quantity, 0),
      count: items.length,
    }),
  );

  // Sort by total quantity
  inputTotals.sort((a, b) => b.total - a.total);
  outputTotals.sort((a, b) => b.total - a.total);

  // Prepare data for line charts
  const prepareUsageHistoryData = (items: InputItem[]) => {
    // Create a map of dates to track quantities by category
    const dateMap = new Map();

    // Process all items with usage history
    items.forEach((item) => {
      if (item.usageHistory && item.usageHistory.length > 0) {
        item.usageHistory.forEach((usage) => {
          const date = new Date(usage.date).toLocaleDateString();
          if (!dateMap.has(date)) {
            dateMap.set(date, { date });
          }

          const dateEntry = dateMap.get(date);
          if (!dateEntry[item.category]) {
            dateEntry[item.category] = 0;
          }
          dateEntry[item.category] += usage.quantity;
        });
      }
    });

    // Convert map to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const prepareHarvestHistoryData = (items: OutputItem[]) => {
    // Create a map of dates to track quantities by category
    const dateMap = new Map();

    // Process all items with harvest history
    items.forEach((item) => {
      if (item.harvestHistory && item.harvestHistory.length > 0) {
        item.harvestHistory.forEach((harvest) => {
          const date = new Date(harvest.date).toLocaleDateString();
          if (!dateMap.has(date)) {
            dateMap.set(date, { date });
          }

          const dateEntry = dateMap.get(date);
          if (!dateEntry[item.category]) {
            dateEntry[item.category] = 0;
          }
          dateEntry[item.category] += harvest.quantity;
        });
      }
    });

    // Convert map to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const usageData = prepareUsageHistoryData(inputs);
  const harvestData = prepareHarvestHistoryData(outputs);

  // Get unique categories for line colors
  const inputCategories = [...new Set(inputs.map((item) => item.category))];
  const outputCategories = [...new Set(outputs.map((item) => item.category))];

  // Color palette for lines
  const colors = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading inventory data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <p className="font-medium">Error loading inventory data</p>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">Showing fallback data instead.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Input Usage by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inputTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={inputTotals.map((item) => ({
                    name: item.category,
                    value: item.total,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Total Units"
                    stroke="#2563eb"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No input data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Output Production by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outputTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={outputTotals.map((item) => ({
                    name: item.category,
                    value: item.total,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Total Units"
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No output data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Input Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Input Usage Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {inputCategories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground flex items-center justify-center h-[300px]">
              <div>
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted" />
                <p>No input usage data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Harvest Yield Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Harvest Yield Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {harvestData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={harvestData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {outputCategories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground flex items-center justify-center h-[300px]">
              <div>
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted" />
                <p>No harvest yield data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryCharts;
