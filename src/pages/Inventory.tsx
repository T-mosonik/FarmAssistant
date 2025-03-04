import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  BarChart3,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdated: Date;
  status: "in-stock" | "low-stock" | "out-of-stock";
  location?: string;
}

interface HarvestRecord {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  harvestDate: Date;
  quality: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: "inv-001",
      name: "Organic Fertilizer",
      category: "Fertilizer",
      quantity: 250,
      unit: "kg",
      lastUpdated: new Date(2023, 5, 15),
      status: "in-stock",
      location: "Storage Shed A",
    },
    {
      id: "inv-002",
      name: "Tomato Seeds",
      category: "Seeds",
      quantity: 5,
      unit: "packets",
      lastUpdated: new Date(2023, 6, 2),
      status: "low-stock",
      location: "Seed Storage",
    },
    {
      id: "inv-003",
      name: "Pesticide - Organic",
      category: "Pesticide",
      quantity: 0,
      unit: "liters",
      lastUpdated: new Date(2023, 5, 28),
      status: "out-of-stock",
      location: "Chemical Storage",
    },
    {
      id: "inv-004",
      name: "Irrigation Pipes",
      category: "Equipment",
      quantity: 120,
      unit: "meters",
      lastUpdated: new Date(2023, 4, 10),
      status: "in-stock",
      location: "Equipment Shed",
    },
    {
      id: "inv-005",
      name: "Corn Seeds",
      category: "Seeds",
      quantity: 12,
      unit: "packets",
      lastUpdated: new Date(2023, 6, 5),
      status: "in-stock",
      location: "Seed Storage",
    },
  ];

  // Mock harvest data
  const harvestRecords: HarvestRecord[] = [
    {
      id: "harv-001",
      cropName: "Tomatoes",
      quantity: 450,
      unit: "kg",
      harvestDate: new Date(2023, 6, 10),
      quality: "excellent",
      notes: "Early harvest, excellent quality",
    },
    {
      id: "harv-002",
      cropName: "Lettuce",
      quantity: 200,
      unit: "kg",
      harvestDate: new Date(2023, 6, 5),
      quality: "good",
      notes: "Some minor pest damage",
    },
    {
      id: "harv-003",
      cropName: "Carrots",
      quantity: 350,
      unit: "kg",
      harvestDate: new Date(2023, 5, 28),
      quality: "fair",
      notes: "Smaller than expected due to drought",
    },
    {
      id: "harv-004",
      cropName: "Corn",
      quantity: 600,
      unit: "kg",
      harvestDate: new Date(2023, 5, 15),
      quality: "good",
    },
  ];

  // Filter inventory items based on search and filters
  const filteredInventoryItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Out of Stock
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get quality badge color
  const getQualityBadge = (quality: HarvestRecord["quality"]) => {
    switch (quality) {
      case "excellent":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Excellent
          </Badge>
        );
      case "good":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Good
          </Badge>
        );
      case "fair":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Fair
          </Badge>
        );
      case "poor":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">Poor</Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>

        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="outputs">Harvest Records</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="Seeds">Seeds</SelectItem>
                    <SelectItem value="Pesticide">Pesticide</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">
                      Item Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Location
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventoryItems.length > 0 ? (
                    filteredInventoryItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4">{item.location}</td>
                        <td className="py-3 px-4">
                          {formatDate(item.lastUpdated)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No inventory items found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Harvest Records Tab */}
          <TabsContent value="outputs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search harvests..." className="pl-10" />
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Record New Harvest
              </Button>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Crop</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Harvest Date
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Quality</th>
                    <th className="py-3 px-4 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {harvestRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{record.cropName}</td>
                      <td className="py-3 px-4">
                        {record.quantity} {record.unit}
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(record.harvestDate)}
                      </td>
                      <td className="py-3 px-4">
                        {getQualityBadge(record.quality)}
                      </td>
                      <td className="py-3 px-4">{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    Inventory Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Items by Category
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Seeds</span>
                          <span className="text-sm font-medium">2 items</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: "40%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fertilizer</span>
                          <span className="text-sm font-medium">1 item</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: "20%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Equipment</span>
                          <span className="text-sm font-medium">1 item</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: "20%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pesticide</span>
                          <span className="text-sm font-medium">1 item</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: "20%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">Stock Status</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-green-600">
                            3
                          </div>
                          <div className="text-xs text-green-800">In Stock</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            1
                          </div>
                          <div className="text-xs text-yellow-800">
                            Low Stock
                          </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-red-600">
                            1
                          </div>
                          <div className="text-xs text-red-800">
                            Out of Stock
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    Harvest Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Harvest by Crop
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Corn</span>
                          <span className="text-sm font-medium">600 kg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tomatoes</span>
                          <span className="text-sm font-medium">450 kg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: "75%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Carrots</span>
                          <span className="text-sm font-medium">350 kg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: "58%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Lettuce</span>
                          <span className="text-sm font-medium">200 kg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: "33%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Harvest Quality
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-green-50 p-2 rounded-md text-center">
                          <div className="text-xl font-bold text-green-600">
                            1
                          </div>
                          <div className="text-xs text-green-800">
                            Excellent
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-md text-center">
                          <div className="text-xl font-bold text-blue-600">
                            2
                          </div>
                          <div className="text-xs text-blue-800">Good</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded-md text-center">
                          <div className="text-xl font-bold text-yellow-600">
                            1
                          </div>
                          <div className="text-xs text-yellow-800">Fair</div>
                        </div>
                        <div className="bg-red-50 p-2 rounded-md text-center">
                          <div className="text-xl font-bold text-red-600">
                            0
                          </div>
                          <div className="text-xs text-red-800">Poor</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Inventory;
