import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Truck, BarChart3, Plus, Trash2 } from "lucide-react";
import InputDetails, { InputItem } from "@/components/inventory/InputDetails";
import OutputDetails, {
  OutputItem,
} from "@/components/inventory/OutputDetails";
import InventoryCharts from "@/components/inventory/InventoryCharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Sample data for inputs
const defaultInputs: InputItem[] = [
  {
    id: "input-1",
    name: "NPK Fertilizer",
    category: "Fertilizer",
    quantity: 250,
    unit: "kg",
    lastUpdated: "2023-07-15",
    status: "In Stock",
    supplier: "AgriSupplies Ltd",
    purchaseDate: "2023-07-01",
    purchasePrice: 45.5,
    usageHistory: [
      {
        id: "usage-1",
        date: "2023-07-10",
        quantity: 50,
        purpose: "Fertilizing",
        fieldOrCrop: "North Corn Field",
        notes: "Applied before rainfall",
      },
      {
        id: "usage-2",
        date: "2023-07-20",
        quantity: 75,
        purpose: "Fertilizing",
        fieldOrCrop: "East Wheat Field",
        notes: "Regular application",
      },
      {
        id: "usage-3",
        date: "2023-08-05",
        quantity: 60,
        purpose: "Fertilizing",
        fieldOrCrop: "South Vegetable Garden",
        notes: "Applied with irrigation",
      },
    ],
  },
  {
    id: "input-2",
    name: "Pesticide X",
    category: "Pesticide",
    quantity: 15,
    unit: "L",
    lastUpdated: "2023-07-12",
    status: "Low Stock",
    supplier: "FarmChem Inc",
    purchaseDate: "2023-06-15",
    purchasePrice: 120.75,
    usageHistory: [
      {
        id: "usage-4",
        date: "2023-06-20",
        quantity: 3,
        purpose: "Pest Control",
        fieldOrCrop: "Tomato Plants",
        notes: "Treated for aphids",
      },
      {
        id: "usage-5",
        date: "2023-07-05",
        quantity: 2,
        purpose: "Pest Control",
        fieldOrCrop: "Apple Orchard",
        notes: "Preventative treatment",
      },
    ],
  },
  {
    id: "input-3",
    name: "Tomato Seeds",
    category: "Seeds",
    quantity: 500,
    unit: "g",
    lastUpdated: "2023-07-05",
    status: "In Stock",
    supplier: "SeedTech",
    purchaseDate: "2023-07-01",
    purchasePrice: 85.0,
    usageHistory: [
      {
        id: "usage-6",
        date: "2023-07-03",
        quantity: 100,
        purpose: "Planting",
        fieldOrCrop: "Greenhouse 1",
        notes: "Spring planting",
      },
      {
        id: "usage-7",
        date: "2023-07-15",
        quantity: 150,
        purpose: "Planting",
        fieldOrCrop: "Greenhouse 2",
        notes: "Summer planting",
      },
    ],
  },
  {
    id: "input-4",
    name: "Irrigation Pipes",
    category: "Equipment",
    quantity: 0,
    unit: "m",
    lastUpdated: "2023-06-20",
    status: "Out of Stock",
    supplier: "FarmTools Co",
    purchaseDate: "2023-05-15",
    purchasePrice: 230.0,
    usageHistory: [
      {
        id: "usage-8",
        date: "2023-05-20",
        quantity: 100,
        purpose: "Installation",
        fieldOrCrop: "North Field",
        notes: "New irrigation system",
      },
      {
        id: "usage-9",
        date: "2023-06-10",
        quantity: 50,
        purpose: "Repair",
        fieldOrCrop: "South Field",
        notes: "Fixed leaking sections",
      },
    ],
  },
  {
    id: "input-5",
    name: "Organic Compost",
    category: "Fertilizer",
    quantity: 1200,
    unit: "kg",
    lastUpdated: "2023-08-01",
    status: "In Stock",
    supplier: "GreenEarth Organics",
    purchaseDate: "2023-07-25",
    purchasePrice: 32.5,
    usageHistory: [
      {
        id: "usage-10",
        date: "2023-08-02",
        quantity: 300,
        purpose: "Soil Amendment",
        fieldOrCrop: "Vegetable Garden",
        notes: "Mixed with topsoil",
      },
      {
        id: "usage-11",
        date: "2023-08-10",
        quantity: 200,
        purpose: "Soil Amendment",
        fieldOrCrop: "Berry Patch",
        notes: "Fall preparation",
      },
    ],
  },
  {
    id: "input-6",
    name: "Tractor Fuel",
    category: "Fuel",
    quantity: 350,
    unit: "L",
    lastUpdated: "2023-08-05",
    status: "In Stock",
    supplier: "Farm Fuels Inc",
    purchaseDate: "2023-08-01",
    purchasePrice: 1.25,
    usageHistory: [
      {
        id: "usage-12",
        date: "2023-08-03",
        quantity: 50,
        purpose: "Harvesting",
        fieldOrCrop: "Wheat Field",
        notes: "Combine harvester",
      },
      {
        id: "usage-13",
        date: "2023-08-07",
        quantity: 30,
        purpose: "Plowing",
        fieldOrCrop: "North Field",
        notes: "Fall preparation",
      },
    ],
  },
  {
    id: "input-7",
    name: "Wheat Seeds",
    category: "Seeds",
    quantity: 800,
    unit: "kg",
    lastUpdated: "2023-09-01",
    status: "In Stock",
    supplier: "GrainGrow Ltd",
    purchaseDate: "2023-08-25",
    purchasePrice: 3.75,
    usageHistory: [
      {
        id: "usage-14",
        date: "2023-09-05",
        quantity: 250,
        purpose: "Planting",
        fieldOrCrop: "East Field",
        notes: "Fall planting",
      },
      {
        id: "usage-15",
        date: "2023-09-10",
        quantity: 300,
        purpose: "Planting",
        fieldOrCrop: "West Field",
        notes: "Fall planting",
      },
    ],
  },
  {
    id: "input-8",
    name: "Calcium Supplement",
    category: "Fertilizer",
    quantity: 175,
    unit: "kg",
    lastUpdated: "2023-07-30",
    status: "In Stock",
    supplier: "AgriSupplies Ltd",
    purchaseDate: "2023-07-20",
    purchasePrice: 28.5,
    usageHistory: [
      {
        id: "usage-16",
        date: "2023-07-25",
        quantity: 25,
        purpose: "Soil Amendment",
        fieldOrCrop: "Apple Orchard",
        notes: "pH adjustment",
      },
    ],
  },
];

// Sample data for outputs
const defaultOutputs: OutputItem[] = [
  {
    id: "output-1",
    name: "Corn",
    category: "Grain",
    quantity: 1500,
    unit: "kg",
    harvestDate: "2023-07-10",
    status: "Stored",
    quality: "Good",
    storageLocation: "Silo 2",
    harvestHistory: [
      {
        id: "harvest-1",
        date: "2023-07-10",
        quantity: 1500,
        quality: "Good",
        fieldOrLocation: "North Field",
        notes: "Good yield despite dry conditions",
      },
      {
        id: "harvest-2",
        date: "2023-08-15",
        quantity: 1800,
        quality: "Excellent",
        fieldOrLocation: "East Field",
        notes: "Excellent yield after irrigation improvements",
      },
      {
        id: "harvest-3",
        date: "2023-09-05",
        quantity: 1650,
        quality: "Good",
        fieldOrLocation: "West Field",
        notes: "Standard yield",
      },
    ],
  },
  {
    id: "output-2",
    name: "Tomatoes",
    category: "Vegetables",
    quantity: 350,
    unit: "kg",
    harvestDate: "2023-07-12",
    status: "Ready for Sale",
    quality: "Excellent",
    storageLocation: "Cold Storage 1",
    harvestHistory: [
      {
        id: "harvest-4",
        date: "2023-07-12",
        quantity: 350,
        quality: "Excellent",
        fieldOrLocation: "Greenhouse 1",
        notes: "First harvest of the season",
      },
      {
        id: "harvest-5",
        date: "2023-07-25",
        quantity: 425,
        quality: "Good",
        fieldOrLocation: "Greenhouse 2",
        notes: "Peak season harvest",
      },
      {
        id: "harvest-6",
        date: "2023-08-10",
        quantity: 300,
        quality: "Average",
        fieldOrLocation: "Greenhouse 1",
        notes: "Late season harvest",
      },
    ],
  },
  {
    id: "output-3",
    name: "Milk",
    category: "Dairy",
    quantity: 200,
    unit: "L",
    harvestDate: "2023-07-15",
    status: "Sold",
    quality: "Good",
    harvestHistory: [
      {
        id: "harvest-7",
        date: "2023-07-15",
        quantity: 200,
        quality: "Good",
        fieldOrLocation: "Dairy Barn",
        notes: "Morning collection",
      },
      {
        id: "harvest-8",
        date: "2023-07-16",
        quantity: 195,
        quality: "Good",
        fieldOrLocation: "Dairy Barn",
        notes: "Morning collection",
      },
      {
        id: "harvest-9",
        date: "2023-07-17",
        quantity: 210,
        quality: "Excellent",
        fieldOrLocation: "Dairy Barn",
        notes: "After feed change",
      },
    ],
  },
  {
    id: "output-4",
    name: "Apples",
    category: "Fruits",
    quantity: 750,
    unit: "kg",
    harvestDate: "2023-09-10",
    status: "Stored",
    quality: "Excellent",
    storageLocation: "Cold Storage 2",
    harvestHistory: [
      {
        id: "harvest-10",
        date: "2023-09-10",
        quantity: 750,
        quality: "Excellent",
        fieldOrLocation: "North Orchard",
        notes: "Early varieties",
      },
      {
        id: "harvest-11",
        date: "2023-09-20",
        quantity: 850,
        quality: "Good",
        fieldOrLocation: "South Orchard",
        notes: "Mid-season varieties",
      },
    ],
  },
  {
    id: "output-5",
    name: "Wheat",
    category: "Grain",
    quantity: 3200,
    unit: "kg",
    harvestDate: "2023-08-20",
    status: "Stored",
    quality: "Good",
    storageLocation: "Silo 1",
    harvestHistory: [
      {
        id: "harvest-12",
        date: "2023-08-20",
        quantity: 3200,
        quality: "Good",
        fieldOrLocation: "East Field",
        notes: "Main harvest",
      },
      {
        id: "harvest-13",
        date: "2023-08-25",
        quantity: 2800,
        quality: "Average",
        fieldOrLocation: "South Field",
        notes: "Affected by late rain",
      },
    ],
  },
  {
    id: "output-6",
    name: "Eggs",
    category: "Poultry",
    quantity: 120,
    unit: "dozen",
    harvestDate: "2023-09-01",
    status: "Ready for Sale",
    quality: "Excellent",
    storageLocation: "Refrigerated Storage",
    harvestHistory: [
      {
        id: "harvest-14",
        date: "2023-09-01",
        quantity: 120,
        quality: "Excellent",
        fieldOrLocation: "Chicken Coop 1",
        notes: "Weekly collection",
      },
      {
        id: "harvest-15",
        date: "2023-09-08",
        quantity: 115,
        quality: "Good",
        fieldOrLocation: "Chicken Coop 1",
        notes: "Weekly collection",
      },
    ],
  },
  {
    id: "output-7",
    name: "Potatoes",
    category: "Vegetables",
    quantity: 1200,
    unit: "kg",
    harvestDate: "2023-08-30",
    status: "Stored",
    quality: "Good",
    storageLocation: "Root Cellar",
    harvestHistory: [
      {
        id: "harvest-16",
        date: "2023-08-30",
        quantity: 1200,
        quality: "Good",
        fieldOrLocation: "West Field",
        notes: "Main harvest",
      },
    ],
  },
  {
    id: "output-8",
    name: "Honey",
    category: "Other",
    quantity: 75,
    unit: "kg",
    harvestDate: "2023-09-15",
    status: "Ready for Sale",
    quality: "Excellent",
    storageLocation: "Processing Room",
    harvestHistory: [
      {
        id: "harvest-17",
        date: "2023-09-15",
        quantity: 75,
        quality: "Excellent",
        fieldOrLocation: "Apiary",
        notes: "Fall harvest",
      },
    ],
  },
];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("inputs");
  const [inputs, setInputs] = useState<InputItem[]>(defaultInputs);
  const [outputs, setOutputs] = useState<OutputItem[]>(defaultOutputs);
  const [selectedInput, setSelectedInput] = useState<InputItem | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<OutputItem | null>(null);
  const [isInputDetailsOpen, setIsInputDetailsOpen] = useState(false);
  const [isOutputDetailsOpen, setIsOutputDetailsOpen] = useState(false);
  const [isAddInputOpen, setIsAddInputOpen] = useState(false);
  const [isAddOutputOpen, setIsAddOutputOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // New input form state
  const [newInput, setNewInput] = useState<
    Omit<InputItem, "id" | "lastUpdated" | "usageHistory">
  >({
    name: "",
    category: "Fertilizer",
    quantity: 0,
    unit: "kg",
    status: "In Stock",
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: 0,
    notes: "",
  });

  // New output form state
  const [newOutput, setNewOutput] = useState<
    Omit<OutputItem, "id" | "harvestDate" | "harvestHistory">
  >({
    name: "",
    category: "Vegetables",
    quantity: 0,
    unit: "kg",
    status: "Stored",
    quality: "Good",
    storageLocation: "",
    notes: "",
  });

  // Handle input selection
  const handleInputSelect = (input: InputItem) => {
    setSelectedInput(input);
    setIsInputDetailsOpen(true);
  };

  // Handle output selection
  const handleOutputSelect = (output: OutputItem) => {
    setSelectedOutput(output);
    setIsOutputDetailsOpen(true);
  };

  // Handle input update
  const handleInputUpdate = (updatedInput: InputItem) => {
    setInputs(
      inputs.map((input) =>
        input.id === updatedInput.id ? updatedInput : input,
      ),
    );
  };

  // Handle output update
  const handleOutputUpdate = (updatedOutput: OutputItem) => {
    setOutputs(
      outputs.map((output) =>
        output.id === updatedOutput.id ? updatedOutput : output,
      ),
    );
  };

  // Handle input deletion
  const handleInputDelete = (inputId: string) => {
    setInputs(inputs.filter((input) => input.id !== inputId));
  };

  // Handle output deletion
  const handleOutputDelete = (outputId: string) => {
    setOutputs(outputs.filter((output) => output.id !== outputId));
  };

  // Handle add new input
  const handleAddInput = () => {
    const newInputItem: InputItem = {
      id: `input-${Date.now()}`,
      lastUpdated: new Date().toISOString().split("T")[0],
      usageHistory: [],
      ...newInput,
    };
    setInputs([...inputs, newInputItem]);
    setIsAddInputOpen(false);
    setNewInput({
      name: "",
      category: "Fertilizer",
      quantity: 0,
      unit: "kg",
      status: "In Stock",
      supplier: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: 0,
      notes: "",
    });
  };

  // Handle add new output
  const handleAddOutput = () => {
    const newOutputItem: OutputItem = {
      id: `output-${Date.now()}`,
      harvestDate: new Date().toISOString().split("T")[0],
      harvestHistory: [],
      ...newOutput,
    };
    setOutputs([...outputs, newOutputItem]);
    setIsAddOutputOpen(false);
    setNewOutput({
      name: "",
      category: "Vegetables",
      quantity: 0,
      unit: "kg",
      status: "Stored",
      quality: "Good",
      storageLocation: "",
      notes: "",
    });
  };

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex gap-2">
          {activeTab === "inputs" && (
            <Dialog open={isAddInputOpen} onOpenChange={setIsAddInputOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Input
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Input</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newInput.name}
                      onChange={(e) =>
                        setNewInput({ ...newInput, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newInput.category}
                      onValueChange={(value) =>
                        setNewInput({ ...newInput, category: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                        <SelectItem value="Pesticide">Pesticide</SelectItem>
                        <SelectItem value="Seeds">Seeds</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newInput.quantity}
                      onChange={(e) =>
                        setNewInput({
                          ...newInput,
                          quantity: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      value={newInput.unit}
                      onChange={(e) =>
                        setNewInput({ ...newInput, unit: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={newInput.status}
                      onValueChange={(value) =>
                        setNewInput({ ...newInput, status: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">
                          Out of Stock
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">
                      Supplier
                    </Label>
                    <Input
                      id="supplier"
                      value={newInput.supplier}
                      onChange={(e) =>
                        setNewInput({ ...newInput, supplier: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="purchaseDate" className="text-right">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newInput.purchaseDate}
                      onChange={(e) =>
                        setNewInput({
                          ...newInput,
                          purchaseDate: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="purchasePrice" className="text-right">
                      Purchase Price
                    </Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={newInput.purchasePrice}
                      onChange={(e) =>
                        setNewInput({
                          ...newInput,
                          purchasePrice: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newInput.notes}
                      onChange={(e) =>
                        setNewInput({ ...newInput, notes: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddInputOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddInput}>Add Input</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "outputs" && (
            <Dialog open={isAddOutputOpen} onOpenChange={setIsAddOutputOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Output
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Output</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newOutput.name}
                      onChange={(e) =>
                        setNewOutput({ ...newOutput, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newOutput.category}
                      onValueChange={(value) =>
                        setNewOutput({ ...newOutput, category: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vegetables">Vegetables</SelectItem>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                        <SelectItem value="Grain">Grain</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Meat">Meat</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newOutput.quantity}
                      onChange={(e) =>
                        setNewOutput({
                          ...newOutput,
                          quantity: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      value={newOutput.unit}
                      onChange={(e) =>
                        setNewOutput({ ...newOutput, unit: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={newOutput.status}
                      onValueChange={(value) =>
                        setNewOutput({ ...newOutput, status: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stored">Stored</SelectItem>
                        <SelectItem value="Ready for Sale">
                          Ready for Sale
                        </SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quality" className="text-right">
                      Quality
                    </Label>
                    <Select
                      value={newOutput.quality}
                      onValueChange={(value) =>
                        setNewOutput({ ...newOutput, quality: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storageLocation" className="text-right">
                      Storage Location
                    </Label>
                    <Input
                      id="storageLocation"
                      value={newOutput.storageLocation}
                      onChange={(e) =>
                        setNewOutput({
                          ...newOutput,
                          storageLocation: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newOutput.notes}
                      onChange={(e) =>
                        setNewOutput({ ...newOutput, notes: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddOutputOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddOutput}>Add Output</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="inputs"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="inputs" className="flex items-center">
            <Package className="mr-2 h-4 w-4" /> Inputs
          </TabsTrigger>
          <TabsTrigger value="outputs" className="flex items-center">
            <Truck className="mr-2 h-4 w-4" /> Outputs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inputs.map((input) => (
              <div
                key={input.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleInputSelect(input)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{input.name}</h3>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      input.status === "In Stock"
                        ? "bg-green-100 text-green-800"
                        : input.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {input.status}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Category: {input.category}
                </div>
                <div className="text-sm font-medium">
                  Quantity: {input.quantity} {input.unit}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Last updated:{" "}
                  {new Date(input.lastUpdated).toLocaleDateString()}
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInput(input);
                      setIsDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {inputs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No inputs available. Add your first input to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="outputs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleOutputSelect(output)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{output.name}</h3>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      output.status === "Ready for Sale"
                        ? "bg-blue-100 text-blue-800"
                        : output.status === "Stored"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {output.status}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Category: {output.category}
                </div>
                <div className="text-sm font-medium">
                  Quantity: {output.quantity} {output.unit}
                </div>
                {output.quality && (
                  <div className="text-sm text-muted-foreground">
                    Quality: {output.quality}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  Harvested: {new Date(output.harvestDate).toLocaleDateString()}
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOutput(output);
                      setIsDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {outputs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No outputs available. Add your first output to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <InventoryCharts inputs={inputs} outputs={outputs} />
        </TabsContent>
      </Tabs>

      {/* Input Details Dialog */}
      {selectedInput && (
        <InputDetails
          item={selectedInput}
          open={isInputDetailsOpen}
          onOpenChange={setIsInputDetailsOpen}
          onUpdate={handleInputUpdate}
        />
      )}

      {/* Output Details Dialog */}
      {selectedOutput && (
        <OutputDetails
          item={selectedOutput}
          open={isOutputDetailsOpen}
          onOpenChange={setIsOutputDetailsOpen}
          onUpdate={handleOutputUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              item from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedInput) {
                  handleInputDelete(selectedInput.id);
                  setSelectedInput(null);
                } else if (selectedOutput) {
                  handleOutputDelete(selectedOutput.id);
                  setSelectedOutput(null);
                }
                setIsDeleteConfirmOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
