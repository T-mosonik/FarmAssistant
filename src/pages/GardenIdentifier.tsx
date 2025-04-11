import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Image, Search, Calendar, Send, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  processImageWithGemini,
  GeminiIdentificationResult,
} from "@/lib/gemini";
import IdentificationReport from "@/components/ai-chat/IdentificationReport";

interface PestRecord {
  id: string;
  name: string;
  date: string;
  location: string;
  affectedPlants: string;
  treatmentPlan: string;
}

const GardenIdentifier = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("identify");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<GeminiIdentificationResult | null>(null);
  const [userCountry, setUserCountry] = useState("Kenya");
  const [pestRecords, setPestRecords] = useState<PestRecord[]>([
    {
      id: "1",
      name: "Aphids",
      date: "March 15th, 2024",
      location: "Vegetable Garden",
      affectedPlants: "Tomatoes, Peppers",
      treatmentPlan: "Neem oil spray applied",
    },
    {
      id: "2",
      name: "Japanese Beetles",
      date: "March 10th, 2024",
      location: "Rose Garden",
      affectedPlants: "Rose bushes",
      treatmentPlan: "Hand picking and organic pesticide",
    },
  ]);

  // History tab filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Get unique locations for filter dropdown
  const uniqueLocations = [
    "All Locations",
    ...new Set(pestRecords.map((record) => record.location)),
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Clear selected image
  const handleClearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Process image with Gemini API
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);

      const result = await processImageWithGemini(
        selectedImage,
        "Identify any plant, pest, or disease in this image",
        userCountry,
      );

      setAnalysisResult(result);

      // If it's a pest or disease, add it to records
      if (result.type !== "plant" || result.name !== "No Disease") {
        const newRecord: PestRecord = {
          id: Date.now().toString(),
          name: result.name,
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          location: "Not specified",
          affectedPlants: Array.isArray(result.plantsAffected)
            ? result.plantsAffected.join(", ")
            : "Unknown",
          treatmentPlan: "See analysis for recommendations",
        };

        setPestRecords((prev) => [newRecord, ...prev]);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      // Set a default error result to display in the UI
      setAnalysisResult({
        name: "Identification Failed",
        description:
          "Unable to identify the image. Please try again with a clearer image.",
        confidence: 0,
        type: "error",
        causes: [],
        plantsAffected: [],
        controlMeasures: {
          chemical: [],
          organic: [],
          cultural: [
            "Try uploading a clearer image",
            "Ensure good lighting when taking photos",
          ],
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Garden Pest & Disease Identifier
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
              <span className="text-sm font-medium">Location</span>
              <select
                className="bg-transparent border-none text-sm"
                value={userCountry}
                onChange={(e) => setUserCountry(e.target.value)}
              >
                <option>Kenya</option>
                <option>Tanzania</option>
                <option>Uganda</option>
                <option>Ethiopia</option>
                <option>Rwanda</option>
              </select>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <span className="sr-only">Toggle theme</span>
              <span className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">
                🌞
              </span>
              <span className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">
                🌙
              </span>
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="identify">Identify Pest/Disease</TabsTrigger>
            <TabsTrigger value="track">Track Pest & Diseases</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="expert">Ask Expert</TabsTrigger>
          </TabsList>

          <TabsContent value="identify" className="flex-1 flex flex-col">
            <Card className="flex-1">
              <CardContent className="flex items-center justify-center h-full p-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-12 flex flex-col items-center justify-center w-full max-w-md mx-auto">
                  {selectedImage ? (
                    <div className="space-y-4 w-full">
                      <div className="relative w-full">
                        <img
                          src={selectedImage}
                          alt="Selected"
                          className="max-w-full max-h-[300px] object-contain rounded-md mx-auto"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={handleClearImage}
                        >
                          ✕
                        </Button>
                      </div>

                      {!analysisResult && !isAnalyzing && (
                        <Button className="w-full" onClick={handleAnalyzeImage}>
                          Analyze Image
                        </Button>
                      )}

                      {isAnalyzing && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                          <p>Analyzing image...</p>
                        </div>
                      )}

                      {analysisResult && (
                        <div className="mt-4 space-y-4">
                          <div className="border rounded-lg p-4 bg-card">
                            <h3 className="text-lg font-semibold mb-2">
                              Analysis Results
                            </h3>
                            <IdentificationReport
                              jsonData={JSON.stringify({
                                identification: {
                                  name: analysisResult.name,
                                  confidence: analysisResult.confidence || 0,
                                  description:
                                    analysisResult.description ||
                                    "No description available",
                                  type: analysisResult.type || "pest",
                                },
                                causes: analysisResult.causes || [],
                                controlMethods: {
                                  chemical:
                                    analysisResult.controlMeasures?.chemical ||
                                    [],
                                  organic:
                                    analysisResult.controlMeasures?.organic ||
                                    [],
                                  cultural:
                                    analysisResult.controlMeasures?.cultural ||
                                    [],
                                },
                                affectedPlants: Array.isArray(
                                  analysisResult.plantsAffected,
                                )
                                  ? analysisResult.plantsAffected
                                  : [],
                                status:
                                  analysisResult.type === "error"
                                    ? "error"
                                    : "identified",
                                message:
                                  analysisResult.type === "error"
                                    ? analysisResult.description
                                    : "",
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mb-4">📷</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Upload a clear image of your plant, pest, or disease
                      </p>
                    </div>
                  )}
                  <div className="flex gap-4 mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        alert(
                          "Camera functionality would be implemented in a mobile app",
                        );
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline" onClick={handleUploadClick}>
                      <Image className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="flex-1">
            <Card className="flex-1">
              <CardContent className="p-6">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <Input type="text" placeholder="April 4th, 2025" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pest/Disease Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Japanese Beetle, Powdery Mildew"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Back garden, tomato bed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Affected Plants
                    </label>
                    <Input type="text" placeholder="e.g., Tomatoes, peppers" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Treatment Plan
                    </label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe your planned treatment method"
                    />
                  </div>
                  <Button className="w-full">Save Record</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="flex-1">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Input
                    placeholder="Search by pest name or location"
                    className="flex-1 min-w-[200px]"
                    prefix={<Search className="h-4 w-4 mr-2" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Input
                    placeholder="Pick a date"
                    className="w-[200px]"
                    prefix={<Calendar className="h-4 w-4 mr-2" />}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    type="date"
                  />
                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[150px]"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    {uniqueLocations.map((location, index) => (
                      <option key={index}>{location}</option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSearchQuery("");
                      setDateFilter("");
                      setLocationFilter("All Locations");
                    }}
                    title="Clear filters"
                  >
                    <span>↺</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pestRecords
                    .filter((record) => {
                      // Filter by search query (name or affected plants)
                      const matchesSearch =
                        searchQuery === "" ||
                        record.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        record.affectedPlants
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());

                      // Filter by date
                      const matchesDate =
                        dateFilter === "" ||
                        new Date(record.date).toISOString().split("T")[0] ===
                          dateFilter;

                      // Filter by location
                      const matchesLocation =
                        locationFilter === "All Locations" ||
                        record.location === locationFilter;

                      return matchesSearch && matchesDate && matchesLocation;
                    })
                    .map((record) => (
                      <Card key={record.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">
                              {record.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {record.date}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p>
                                <strong>Location:</strong> {record.location}
                              </p>
                              <p>
                                <strong>Affected Plants:</strong>{" "}
                                {record.affectedPlants}
                              </p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <p>
                                <strong>Treatment Plan:</strong>{" "}
                                {record.treatmentPlan}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  {pestRecords.filter((record) => {
                    const matchesSearch =
                      searchQuery === "" ||
                      record.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      record.affectedPlants
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    const matchesDate =
                      dateFilter === "" ||
                      new Date(record.date).toISOString().split("T")[0] ===
                        dateFilter;
                    const matchesLocation =
                      locationFilter === "All Locations" ||
                      record.location === locationFilter;
                    return matchesSearch && matchesDate && matchesLocation;
                  }).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No records match your filters</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchQuery("");
                          setDateFilter("");
                          setLocationFilter("All Locations");
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expert" className="flex-1">
            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-6">
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    <p className="text-center text-muted-foreground mb-8">
                      Ask about farming, gardening, or pest control...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Input
                    placeholder="Ask about farming, gardening, or pest control..."
                    className="flex-1"
                  />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GardenIdentifier;
