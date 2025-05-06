import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Truck, Loader2 } from "lucide-react";
import { InputItem } from "./InputDetails";
import { OutputItem } from "./OutputDetails";
import { supabase } from "@/lib/supabase";

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
  // This is a placeholder component for charts
  // In a real implementation, you would use a charting library like recharts, chart.js, or visx

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

  // Calculate max values for scaling the bars
  const maxInputTotal = Math.max(...inputTotals.map((item) => item.total), 1);
  const maxOutputTotal = Math.max(...outputTotals.map((item) => item.total), 1);

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
            <div className="space-y-4">
              {inputTotals.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.total} units ({item.count} items)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(item.total / maxInputTotal) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {inputTotals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No input data available</p>
                </div>
              )}
            </div>
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
            <div className="space-y-4">
              {outputTotals.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.total} units ({item.count} items)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(item.total / maxOutputTotal) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {outputTotals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No output data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Input Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted" />
            <p>Input usage trends will be displayed here</p>
            <p className="text-sm mt-2">
              This chart will show usage patterns over time when more data is
              available
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Harvest Yield Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Harvest Yield Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted" />
            <p>Harvest yield comparison will be displayed here</p>
            <p className="text-sm mt-2">
              Compare yields across different crops and seasons when more data
              is available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryCharts;
