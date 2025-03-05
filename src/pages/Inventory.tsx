import React, { useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Plus,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("inputs");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock inventory data
  const inputs = [
    {
      id: "1",
      name: "NPK Fertilizer",
      category: "Fertilizer",
      quantity: 500,
      unit: "kg",
      lastUpdated: "2023-07-10",
      status: "In Stock",
    },
    {
      id: "2",
      name: "Tomato Seeds",
      category: "Seeds",
      quantity: 100,
      unit: "packets",
      lastUpdated: "2023-07-12",
      status: "Low Stock",
    },
    {
      id: "3",
      name: "Pesticide - Organic",
      category: "Pesticides",
      quantity: 50,
      unit: "liters",
      lastUpdated: "2023-07-08",
      status: "In Stock",
    },
    {
      id: "4",
      name: "Irrigation Pipes",
      category: "Equipment",
      quantity: 20,
      unit: "pieces",
      lastUpdated: "2023-06-30",
      status: "In Stock",
    },
    {
      id: "5",
      name: "Chicken Feed",
      category: "Feed",
      quantity: 10,
      unit: "bags",
      lastUpdated: "2023-07-14",
      status: "Low Stock",
    },
  ];

  const outputs = [
    {
      id: "1",
      name: "Tomatoes",
      category: "Vegetables",
      quantity: 200,
      unit: "kg",
      harvestDate: "2023-07-05",
      status: "Ready for Sale",
    },
    {
      id: "2",
      name: "Eggs",
      category: "Poultry Products",
      quantity: 500,
      unit: "dozens",
      harvestDate: "2023-07-15",
      status: "Ready for Sale",
    },
    {
      id: "3",
      name: "Corn",
      category: "Grains",
      quantity: 1000,
      unit: "kg",
      harvestDate: "2023-06-28",
      status: "Stored",
    },
    {
      id: "4",
      name: "Milk",
      category: "Dairy",
      quantity: 100,
      unit: "liters",
      harvestDate: "2023-07-15",
      status: "Ready for Sale",
    },
  ];

  // Filter data based on search query
  const filteredInputs = inputs.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredOutputs = outputs.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate inventory stats
  const calculateStats = () => {
    const totalInputItems = inputs.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const totalOutputItems = outputs.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const lowStockItems = inputs.filter(
      (item) => item.status === "Low Stock",
    ).length;
    const readyForSaleItems = outputs.filter(
      (item) => item.status === "Ready for Sale",
    ).length;

    return {
      totalInputItems,
      totalOutputItems,
      lowStockItems,
      readyForSaleItems,
    };
  };

  const stats = calculateStats();

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            In Stock
          </Badge>
        );
      case "Low Stock":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Low Stock
          </Badge>
        );
      case "Out of Stock":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Out of Stock
          </Badge>
        );
      case "Ready for Sale":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Ready for Sale
          </Badge>
        );
      case "Stored":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
            Stored
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Farm Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inputs.length}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalInputItems} items in stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Farm Outputs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outputs.length}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalOutputItems} items harvested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items needing restock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ready for Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.readyForSaleItems}
              </div>
              <p className="text-xs text-muted-foreground">
                Items ready for market
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="inputs"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 md:mb-6 w-full overflow-x-auto">
            <TabsTrigger value="inputs" className="flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Farm Inputs
            </TabsTrigger>
            <TabsTrigger value="outputs" className="flex items-center">
              <Truck className="mr-2 h-4 w-4" />
              Farm Outputs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add {activeTab === "inputs" ? "Input" : "Output"}
            </Button>
          </div>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Last Updated
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          Loading inventory data...
                        </div>
                      </td>
                    </tr>
                  ) : filteredInputs.length > 0 ? (
                    filteredInputs.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(item.lastUpdated)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No inputs found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Outputs Tab */}
          <TabsContent value="outputs" className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Harvest Date
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          Loading harvest data...
                        </div>
                      </td>
                    </tr>
                  ) : filteredOutputs.length > 0 ? (
                    filteredOutputs.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(item.harvestDate)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No outputs found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input Usage Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted" />
                    <p>Input usage analytics will be displayed here</p>
                    <p className="text-sm mt-2">
                      Track your farm input consumption over time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Harvest Yields</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted" />
                    <p>Harvest yield analytics will be displayed here</p>
                    <p className="text-sm mt-2">
                      Compare yields across different crops and seasons
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Value Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>
                    This feature is coming soon. Track the value of your
                    inventory over time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Inventory;
