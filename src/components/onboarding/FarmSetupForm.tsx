import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FarmSetupFormProps {
  onSetupComplete: (values: any) => void;
  isLoading?: boolean;
}

const FarmSetupForm = ({
  onSetupComplete,
  isLoading = false,
}: FarmSetupFormProps) => {
  const [farmData, setFarmData] = useState({
    farmName: "",
    farmType: "mixed",
    farmSize: "",
    sizeUnit: "acres",
    location: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFarmData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFarmData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete(farmData);
  };

  return (
    <Card className="w-full max-w-[90%] sm:max-w-2xl mx-auto bg-background">
      <CardHeader>
        <CardTitle className="text-2xl">Farm Setup</CardTitle>
        <CardDescription>
          Tell us about your farm to get started
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="farmName">Farm Name</Label>
            <Input
              id="farmName"
              name="farmName"
              placeholder="Green Valley Farm"
              value={farmData.farmName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmType">Farm Type</Label>
              <Select
                value={farmData.farmType}
                onValueChange={(value) => handleSelectChange("farmType", value)}
              >
                <SelectTrigger id="farmType">
                  <SelectValue placeholder="Select farm type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crop">Crop Farm</SelectItem>
                  <SelectItem value="livestock">Livestock Farm</SelectItem>
                  <SelectItem value="mixed">Mixed Farm</SelectItem>
                  <SelectItem value="orchard">Orchard</SelectItem>
                  <SelectItem value="vegetable">Vegetable Farm</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="City, State/Province"
                value={farmData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size</Label>
              <Input
                id="farmSize"
                name="farmSize"
                type="number"
                placeholder="50"
                value={farmData.farmSize}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeUnit">Unit</Label>
              <Select
                value={farmData.sizeUnit}
                onValueChange={(value) => handleSelectChange("sizeUnit", value)}
              >
                <SelectTrigger id="sizeUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acres">Acres</SelectItem>
                  <SelectItem value="hectares">Hectares</SelectItem>
                  <SelectItem value="sqft">Square Feet</SelectItem>
                  <SelectItem value="sqm">Square Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Farm Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us more about your farm..."
              value={farmData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !farmData.farmName ||
              !farmData.farmType ||
              !farmData.farmSize ||
              !farmData.location
            }
          >
            {isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FarmSetupForm;
