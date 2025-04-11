import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Calendar, Truck, History, BarChart3 } from "lucide-react";

export interface OutputItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  status: string;
  harvestHistory?: HarvestRecord[];
  notes?: string;
  quality?: string;
  storageLocation?: string;
}

export interface HarvestRecord {
  id: string;
  date: string;
  quantity: number;
  quality?: string;
  fieldOrLocation?: string;
  notes?: string;
}

interface OutputDetailsProps {
  item: OutputItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedItem: OutputItem) => void;
}

const OutputDetails: React.FC<OutputDetailsProps> = ({
  item,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);
  const [quantity, setQuantity] = useState("0");
  const [quality, setQuality] = useState("Good");
  const [fieldOrLocation, setFieldOrLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [itemNotes, setItemNotes] = useState(item.notes || "");
  const [storageLocation, setStorageLocation] = useState(
    item.storageLocation || "",
  );

  // Initialize harvest history if it doesn't exist
  const harvestHistory = item.harvestHistory || [];

  const handleAddHarvest = () => {
    const newQuantity = item.quantity + Number(quantity);
    const newHarvestRecord: HarvestRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      quantity: Number(quantity),
      quality,
      fieldOrLocation,
      notes,
    };

    const updatedHistory = [newHarvestRecord, ...harvestHistory];
    const updatedItem = {
      ...item,
      quantity: newQuantity,
      harvestDate: new Date().toISOString().split("T")[0],
      harvestHistory: updatedHistory,
      notes: itemNotes,
      storageLocation,
      quality: harvestHistory.length === 0 ? quality : item.quality,
    };

    onUpdate(updatedItem);
    setIsAddingHarvest(false);
    setQuantity("0");
    setQuality("Good");
    setFieldOrLocation("");
    setNotes("");
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
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
      case "Sold":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Sold
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get quality badge
  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "Excellent":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Excellent
          </Badge>
        );
      case "Good":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Good
          </Badge>
        );
      case "Average":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Average
          </Badge>
        );
      case "Poor":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">Poor</Badge>
        );
      default:
        return <Badge>{quality}</Badge>;
    }
  };

  // Calculate total harvest quantity
  const totalHarvested = harvestHistory.reduce(
    (sum, record) => sum + record.quantity,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Category:
                    </span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current Quantity:
                    </span>
                    <span className="font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Harvested:
                    </span>
                    <span className="font-medium">
                      {totalHarvested} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <span>{getStatusBadge(item.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Harvest:
                    </span>
                    <span className="font-medium">
                      {formatDate(item.harvestDate)}
                    </span>
                  </div>
                  {item.quality && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Quality:
                      </span>
                      <span>{getQualityBadge(item.quality)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage & Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Storage Location
                    </label>
                    <Input
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="Where is this stored?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="Add notes about this harvest..."
                      className="h-[80px]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const updatedItem = {
                        ...item,
                        notes: itemNotes,
                        storageLocation,
                      };
                      onUpdate(updatedItem);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Harvest Management */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setIsAddingHarvest(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Record New Harvest
            </Button>
          </div>

          {/* Add Harvest Form */}
          {isAddingHarvest && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Record Harvest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Quantity Harvested
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quality</label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Average">Average</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Field or Location
                    </label>
                    <Input
                      type="text"
                      value={fieldOrLocation}
                      onChange={(e) => setFieldOrLocation(e.target.value)}
                      placeholder="Where was this harvested from?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional details about this harvest..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingHarvest(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddHarvest}>Record Harvest</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Harvest History */}
          <div>
            <div className="flex items-center mb-4">
              <History className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Harvest History</h3>
            </div>

            {harvestHistory.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Quantity
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Quality
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Location
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvestHistory.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{formatDate(record.date)}</td>
                        <td className="py-3 px-4">
                          {record.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {record.quality
                            ? getQualityBadge(record.quality)
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {record.fieldOrLocation || "-"}
                        </td>
                        <td className="py-3 px-4">{record.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No harvest history recorded yet</p>
                <p className="text-sm">
                  Harvest records will appear here when you record harvests
                </p>
              </div>
            )}
          </div>

          {/* Performance Metrics Placeholder */}
          <div>
            <div className="flex items-center mb-4">
              <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Performance Metrics</h3>
            </div>
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Performance metrics will be displayed here</p>
              <p className="text-sm">
                Track yield trends and compare with previous seasons
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutputDetails;
