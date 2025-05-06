import React, { useState, useEffect } from "react";
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
import { Plus, Minus, Calendar, Package, History, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export interface InputItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
  status: string;
  usageHistory?: UsageRecord[];
  supplier?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  quantity: number;
  purpose: string;
  fieldOrCrop?: string;
  notes?: string;
}

interface InputDetailsProps {
  item: InputItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedItem: InputItem) => void;
}

const InputDetails: React.FC<InputDetailsProps> = ({
  item,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isRemovingStock, setIsRemovingStock] = useState(false);
  const [quantity, setQuantity] = useState("0");
  const [purpose, setPurpose] = useState("");
  const [fieldOrCrop, setFieldOrCrop] = useState("");
  const [notes, setNotes] = useState("");
  const [supplier, setSupplier] = useState(item.supplier || "");
  const [purchasePrice, setPurchasePrice] = useState(
    item.purchasePrice?.toString() || "",
  );
  const [itemNotes, setItemNotes] = useState(item.notes || "");

  // Initialize usage history if it doesn't exist
  const usageHistory = item.usageHistory || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to determine status based on quantity
  const getStatusFromQuantity = (qty: number): string => {
    if (qty === 0) return "Out of Stock";
    if (qty < 10) return "Low Stock";
    return "In Stock";
  };

  const handleAddStock = () => {
    if (!quantity || Number(quantity) <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const newQuantity = item.quantity + Number(quantity);
    const updatedItem = {
      ...item,
      quantity: newQuantity,
      status: getStatusFromQuantity(newQuantity),
      lastUpdated: new Date().toISOString().split("T")[0],
      supplier: supplier,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      notes: itemNotes,
    };

    // Use local state management instead of Supabase for now
    setTimeout(() => {
      toast({
        title: "Stock added",
        description: `Added ${quantity} ${item.unit} of ${item.name}`,
      });

      onUpdate(updatedItem);
      setIsAddingStock(false);
      setQuantity("0");
      setSupplier("");
      setPurchasePrice("");
      setIsSubmitting(false);
    }, 500);
  };

  const [usageDate, setUsageDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleRemoveStock = () => {
    const qtyToRemove = Number(quantity);
    if (qtyToRemove > item.quantity) {
      toast({
        title: "Invalid quantity",
        description: "Cannot remove more than available stock",
        variant: "destructive",
      });
      return;
    }

    if (!purpose) {
      toast({
        title: "Missing information",
        description: "Please select a purpose for this usage",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const newQuantity = item.quantity - qtyToRemove;
    const newUsageRecord: UsageRecord = {
      id: Date.now().toString(),
      date: usageDate,
      quantity: qtyToRemove,
      purpose,
      fieldOrCrop,
      notes,
    };

    const updatedHistory = [newUsageRecord, ...usageHistory];
    const updatedItem = {
      ...item,
      quantity: newQuantity,
      status: getStatusFromQuantity(newQuantity),
      lastUpdated: new Date().toISOString().split("T")[0],
      usageHistory: updatedHistory,
      notes: itemNotes,
    };

    // Use local state management instead of Supabase for now
    setTimeout(() => {
      toast({
        title: "Usage recorded",
        description: `Recorded usage of ${qtyToRemove} ${item.unit} of ${item.name}`,
      });

      onUpdate(updatedItem);
      setIsRemovingStock(false);
      setQuantity("0");
      setPurpose("");
      setFieldOrCrop("");
      setNotes("");
      setIsSubmitting(false);
    }, 500);
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
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
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
                      Quantity:
                    </span>
                    <span className="font-medium">
                      {item.quantity} {item.unit}
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
                      Last Updated:
                    </span>
                    <span className="font-medium">
                      {formatDate(item.lastUpdated)}
                    </span>
                  </div>
                  {item.supplier && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Supplier:
                      </span>
                      <span className="font-medium">{item.supplier}</span>
                    </div>
                  )}
                  {item.purchasePrice && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Purchase Price:
                      </span>
                      <span className="font-medium">
                        KSH {item.purchasePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Add notes about this item..."
                  className="h-[120px]"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const updatedItem = {
                      ...item,
                      notes: itemNotes,
                    };
                    onUpdate(updatedItem);
                  }}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stock Management */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setIsAddingStock(true);
                setIsRemovingStock(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Stock
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setIsRemovingStock(true);
                setIsAddingStock(false);
              }}
            >
              <Minus className="mr-2 h-4 w-4" /> Use Stock
            </Button>
          </div>

          {/* Add Stock Form */}
          {isAddingStock && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Add Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Quantity to Add
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Supplier</label>
                      <Input
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="Supplier name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Purchase Price
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingStock(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddStock} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Stock"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Remove Stock Form */}
          {isRemovingStock && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Use Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Usage Date</label>
                      <Input
                        type="date"
                        value={usageDate}
                        onChange={(e) => setUsageDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Quantity to Use
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity.toString()}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Purpose</label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planting">Planting</SelectItem>
                          <SelectItem value="Fertilizing">
                            Fertilizing
                          </SelectItem>
                          <SelectItem value="Pest Control">
                            Pest Control
                          </SelectItem>
                          <SelectItem value="Disease Control">
                            Disease Control
                          </SelectItem>
                          <SelectItem value="Irrigation">Irrigation</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Field or Crop</label>
                    <Input
                      type="text"
                      value={fieldOrCrop}
                      onChange={(e) => setFieldOrCrop(e.target.value)}
                      placeholder="Where was this used?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional details about this usage..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsRemovingStock(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleRemoveStock} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        "Record Usage"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage History */}
          <div>
            <div className="flex items-center mb-4">
              <History className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Usage History</h3>
            </div>

            {usageHistory.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Quantity
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Purpose
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Field/Crop
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageHistory.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{formatDate(record.date)}</td>
                        <td className="py-3 px-4">
                          {record.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4">{record.purpose}</td>
                        <td className="py-3 px-4">
                          {record.fieldOrCrop || "-"}
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
                <p>No usage history recorded yet</p>
                <p className="text-sm">
                  Usage records will appear here when you use stock
                </p>
              </div>
            )}
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

export default InputDetails;
