import React from "react";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MarketWatchProps {
  className?: string;
}

interface PriceData {
  commodity: string;
  price: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
}

const MarketWatch: React.FC<MarketWatchProps> = ({ className }) => {
  // Mock data - in a real app, this would come from an API or context
  const marketData: PriceData[] = [
    {
      commodity: "Maize",
      price: 45.5,
      unit: "kg",
      change: 2.5,
      trend: "up",
    },
    {
      commodity: "Beans",
      price: 120.0,
      unit: "kg",
      change: -5.0,
      trend: "down",
    },
    {
      commodity: "Tomatoes",
      price: 80.75,
      unit: "kg",
      change: 10.25,
      trend: "up",
    },
    {
      commodity: "Potatoes",
      price: 35.0,
      unit: "kg",
      change: 0.0,
      trend: "stable",
    },
  ];

  // Get trend badge
  const getTrendBadge = (trend: PriceData["trend"], change: number) => {
    switch (trend) {
      case "up":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />+{Math.abs(change).toFixed(2)}
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />-{Math.abs(change).toFixed(2)}
          </Badge>
        );
      case "stable":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            Stable
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Market Watch</span>
          <Link to="/market">
            <Button variant="ghost" size="sm" className="h-7 gap-1">
              <span className="text-xs">View All</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {marketData.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-1 border-b last:border-0"
            >
              <div>
                <div className="font-medium">{item.commodity}</div>
                <div className="text-sm text-muted-foreground">
                  {item.price.toFixed(2)} KES/{item.unit}
                </div>
              </div>
              <div>{getTrendBadge(item.trend, item.change)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { MarketWatch };
export default MarketWatch;
