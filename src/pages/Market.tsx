import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  Info,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface PriceData {
  id: string;
  commodity: string;
  market: string;
  price: number;
  unit: string;
  date: string;
  change: number;
  trend: "up" | "down" | "stable";
  category: string;
}

const Market = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [filteredData, setFilteredData] = useState<PriceData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PriceData;
    direction: "ascending" | "descending";
  }>({ key: "date", direction: "descending" });

  // Fetch price data from API
  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be a fetch call to the API
        // const response = await fetch("https://statistics.kilimo.go.ke/en/api/apputils/");
        // const data = await response.json();

        // Mock data for demonstration
        const mockData: PriceData[] = [
          {
            id: "1",
            commodity: "Maize",
            market: "Nairobi",
            price: 45.5,
            unit: "kg",
            date: "2023-07-15",
            change: 2.5,
            trend: "up",
            category: "Cereals",
          },
          {
            id: "2",
            commodity: "Beans",
            market: "Mombasa",
            price: 120.0,
            unit: "kg",
            date: "2023-07-15",
            change: -5.0,
            trend: "down",
            category: "Legumes",
          },
          {
            id: "3",
            commodity: "Tomatoes",
            market: "Kisumu",
            price: 80.75,
            unit: "kg",
            date: "2023-07-14",
            change: 10.25,
            trend: "up",
            category: "Vegetables",
          },
          {
            id: "4",
            commodity: "Potatoes",
            market: "Nakuru",
            price: 35.0,
            unit: "kg",
            date: "2023-07-14",
            change: 0.0,
            trend: "stable",
            category: "Tubers",
          },
          {
            id: "5",
            commodity: "Bananas",
            market: "Nairobi",
            price: 250.0,
            unit: "bunch",
            date: "2023-07-13",
            change: 15.0,
            trend: "up",
            category: "Fruits",
          },
          {
            id: "6",
            commodity: "Rice",
            market: "Mombasa",
            price: 130.0,
            unit: "kg",
            date: "2023-07-13",
            change: -2.0,
            trend: "down",
            category: "Cereals",
          },
          {
            id: "7",
            commodity: "Onions",
            market: "Kisumu",
            price: 90.5,
            unit: "kg",
            date: "2023-07-12",
            change: 5.5,
            trend: "up",
            category: "Vegetables",
          },
          {
            id: "8",
            commodity: "Wheat",
            market: "Nakuru",
            price: 50.0,
            unit: "kg",
            date: "2023-07-12",
            change: -1.5,
            trend: "down",
            category: "Cereals",
          },
          {
            id: "9",
            commodity: "Cabbage",
            market: "Nairobi",
            price: 40.0,
            unit: "head",
            date: "2023-07-11",
            change: 0.0,
            trend: "stable",
            category: "Vegetables",
          },
          {
            id: "10",
            commodity: "Mangoes",
            market: "Mombasa",
            price: 180.0,
            unit: "dozen",
            date: "2023-07-11",
            change: 20.0,
            trend: "up",
            category: "Fruits",
          },
        ];

        setPriceData(mockData);
        setFilteredData(mockData);
      } catch (error) {
        console.error("Error fetching price data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...priceData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.commodity.toLowerCase().includes(query) ||
          item.market.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Apply market filter
    if (marketFilter !== "all") {
      result = result.filter((item) => item.market === marketFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(result);
  }, [priceData, searchQuery, categoryFilter, marketFilter, sortConfig]);

  // Get unique categories and markets for filters
  const categories = [
    "all",
    ...new Set(priceData.map((item) => item.category)),
  ];
  const markets = ["all", ...new Set(priceData.map((item) => item.market))];

  // Handle sort request
  const requestSort = (key: keyof PriceData) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  // Calculate market statistics
  const calculateStats = () => {
    const totalCommodities = new Set(priceData.map((item) => item.commodity))
      .size;
    const totalMarkets = new Set(priceData.map((item) => item.market)).size;

    const increasingPrices = priceData.filter(
      (item) => item.trend === "up",
    ).length;
    const decreasingPrices = priceData.filter(
      (item) => item.trend === "down",
    ).length;

    const latestDate =
      priceData.length > 0
        ? new Date(
            Math.max(...priceData.map((item) => new Date(item.date).getTime())),
          )
        : new Date();

    return {
      totalCommodities,
      totalMarkets,
      increasingPrices,
      decreasingPrices,
      latestUpdate: latestDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  const stats = calculateStats();

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Market Price Watch</h1>
          <Button
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              // Simulate refresh
              setTimeout(() => setIsLoading(false), 1000);
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="prices" className="w-full">
          <TabsList className="mb-4 md:mb-6 w-full overflow-x-auto">
            <TabsTrigger value="prices" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Price Listings
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Market Trends
            </TabsTrigger>
          </TabsList>

          {/* Price Listings Tab */}
          <TabsContent value="prices" className="space-y-6">
            {/* Market Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Commodities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalCommodities}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total tracked commodities
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Markets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMarkets}</div>
                  <p className="text-xs text-muted-foreground">
                    Active market locations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Price Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      {stats.increasingPrices} ↑
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      {stats.decreasingPrices} ↓
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Increasing vs decreasing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{stats.latestUpdate}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Data refresh frequency: daily
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search commodity or market..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={marketFilter} onValueChange={setMarketFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market} value={market}>
                        {market === "all" ? "All Markets" : market}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Table */}
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">
                      <button
                        className="flex items-center"
                        onClick={() => requestSort("commodity")}
                      >
                        Commodity
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      <button
                        className="flex items-center"
                        onClick={() => requestSort("market")}
                      >
                        Market
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      <button
                        className="flex items-center"
                        onClick={() => requestSort("category")}
                      >
                        Category
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      <button
                        className="flex items-center"
                        onClick={() => requestSort("price")}
                      >
                        Price
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      <button
                        className="flex items-center"
                        onClick={() => requestSort("change")}
                      >
                        Change
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      <button
                        className="flex items-center"
                        onClick={() => requestSort("date")}
                      >
                        Date
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          Loading price data...
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {item.commodity}
                        </td>
                        <td className="py-3 px-4">{item.market}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">
                          {item.price.toFixed(2)} KES/{item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {getTrendBadge(item.trend, item.change)}
                        </td>
                        <td className="py-3 px-4">{formatDate(item.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No price data found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Data source: Kenya Agricultural and Livestock Research
              Organization (KALRO)
            </div>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Trends by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Price Trends by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories
                      .filter((category) => category !== "all")
                      .map((category) => {
                        const categoryItems = priceData.filter(
                          (item) => item.category === category,
                        );
                        const increasingCount = categoryItems.filter(
                          (item) => item.trend === "up",
                        ).length;
                        const decreasingCount = categoryItems.filter(
                          (item) => item.trend === "down",
                        ).length;
                        const stableCount = categoryItems.filter(
                          (item) => item.trend === "stable",
                        ).length;
                        const total = categoryItems.length;

                        return (
                          <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{category}</span>
                              <div className="flex gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-green-100 text-green-800 border-green-300">
                                        {increasingCount}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Increasing prices</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-red-100 text-red-800 border-red-300">
                                        {decreasingCount}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Decreasing prices</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                        {stableCount}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Stable prices</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>

                            <div className="w-full flex h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="bg-green-500 h-full"
                                style={{
                                  width: `${(increasingCount / total) * 100}%`,
                                }}
                              ></div>
                              <div
                                className="bg-red-500 h-full"
                                style={{
                                  width: `${(decreasingCount / total) * 100}%`,
                                }}
                              ></div>
                              <div
                                className="bg-gray-400 h-full"
                                style={{
                                  width: `${(stableCount / total) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Market Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {markets
                      .filter((market) => market !== "all")
                      .map((market) => {
                        const marketItems = priceData.filter(
                          (item) => item.market === market,
                        );
                        const commodityCount = new Set(
                          marketItems.map((item) => item.commodity),
                        ).size;
                        const latestDate = new Date(
                          Math.max(
                            ...marketItems.map((item) =>
                              new Date(item.date).getTime(),
                            ),
                          ),
                        );

                        // Calculate average price change
                        const totalChange = marketItems.reduce(
                          (sum, item) => sum + item.change,
                          0,
                        );
                        const avgChange =
                          totalChange / (marketItems.length || 1);

                        return (
                          <div key={market} className="border-b pb-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{market}</h3>
                              {avgChange > 0 ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-1" />+
                                  {avgChange.toFixed(2)}%
                                </Badge>
                              ) : avgChange < 0 ? (
                                <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  {avgChange.toFixed(2)}%
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                  Stable
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {commodityCount} commodities tracked
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Last updated:{" "}
                              {formatDate(latestDate.toISOString())}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Volatility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceData
                    .filter((item) => Math.abs(item.change) > 5)
                    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <div className="font-medium">{item.commodity}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.market} • {item.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {item.price.toFixed(2)} KES/{item.unit}
                          </div>
                          <div>{getTrendBadge(item.trend, item.change)}</div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing commodities with price changes greater than 5%
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Market;
