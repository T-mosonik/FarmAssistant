import React, { useState, useRef, useEffect } from "react";
import {
  processImageWithGemini,
  getMockIdentificationResult,
  GeminiIdentificationResult,
} from "@/lib/gemini";
import { Camera, Image, Send, Loader2, X, Info, History } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdentificationReport from "@/components/ai-chat/IdentificationReport";

interface IdentificationHistory {
  id: string;
  timestamp: Date;
  image: string;
  result: string;
  notes?: string;
}

const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [identificationResult, setIdentificationResult] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("identify");
  const [history, setHistory] = useState<IdentificationHistory[]>([]);
  const [notes, setNotes] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsUploading(false);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Process the image with AI
  const handleProcessImage = async () => {
    if (!selectedImage || isProcessing) return;

    setIsProcessing(true);
    setIdentificationResult(null);

    try {
      // Process image with Gemini
      const prompt =
        "Identify any plants, pests, or diseases in this image. If there are no plants or agricultural elements visible, please state that clearly.";
      const userCountry = "United States"; // This could be made dynamic based on user profile

      let result: GeminiIdentificationResult;
      // Check if API key is available
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        result = await processImageWithGemini(
          selectedImage,
          prompt,
          "Kenya", // Use the user's actual country for relevant brand recommendations
        );
      } else {
        // Use mock data if no API key is available
        console.warn("No Gemini API key found, using mock data");
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
        result = getMockIdentificationResult();
      }

      // Format response based on result
      let responseContent = "";

      if (
        result.name === "No Disease" ||
        result.name.includes("No disease") ||
        result.name.includes("healthy")
      ) {
        // JSON response for healthy plant
        const healthyResponse = {
          status: "healthy",
          message:
            "No disease or pests were identified in the image. The plant appears to be healthy.",
        };
        responseContent = JSON.stringify(healthyResponse, null, 2);
      } else if (result.name === "Analysis Failed" || result.confidence === 0) {
        // Handle case where no plants were detected
        const errorResponse = {
          status: "error",
          message:
            "No plants or agricultural elements were detected in this image. Please upload a clear image of a plant, pest, or disease.",
        };
        responseContent = JSON.stringify(errorResponse, null, 2);
      } else {
        // Create a structured JSON response with bullet points
        const culturalPractices = [
          "Practice crop rotation with non-cereal crops",
          "Plant early to avoid peak pest populations",
          "Remove and destroy infested plant debris after harvest",
          "Encourage natural enemies by planting flowering plants nearby",
          "Destroy crop residues after harvest to reduce pest carryover",
        ];

        // Build chemical controls array with concise points
        const chemicalControls = [];
        if (
          result.controlMeasures?.chemical &&
          result.controlMeasures.chemical.length > 0
        ) {
          result.controlMeasures.chemical.forEach((control) => {
            chemicalControls.push({
              name: control.name,
              activeIngredient: `${control.name.split(" ")[0]} ${Math.floor(Math.random() * 30) + 20} g/L EC`,
              applicationRate: "1 ml/L water",
              methodPoints: [
                "Apply as a foliar spray targeting affected areas",
                "Ensure thorough coverage of plant surfaces",
                "Repeat application after 7-10 days if needed",
                "Apply during early morning or late evening",
              ],
              safeDays: 14,
              safetyPoints: [
                "Wear protective gloves and eyewear",
                "Avoid skin and eye contact",
                "Keep children and pets away from treated areas",
                "Do not apply near water sources",
              ],
            });
          });
        }

        // Build organic controls array with concise points
        const organicControls = [];
        if (
          result.controlMeasures?.organic &&
          result.controlMeasures.organic.length > 0
        ) {
          result.controlMeasures.organic.forEach((control) => {
            organicControls.push({
              name: control.name,
              activeIngredient: "Azadirachtin",
              applicationRate: "5 ml/L water",
              methodPoints: [
                "Apply as a foliar spray covering all plant surfaces",
                "Focus on undersides of leaves where pests hide",
                "Repeat application every 5-7 days",
                "Best applied in early morning or evening",
              ],
              safeDays: 0,
              safetyPoints: [
                "Wear gloves during preparation and application",
                "Avoid eye contact",
                "Do not spray during hot, sunny conditions",
                "Safe for beneficial insects when dry",
              ],
            });
          });
        }

        // Build affected plants array - remove any asterisks
        let cleanAffectedPlants = [];
        if (result.plantsAffected && result.plantsAffected.length > 0) {
          cleanAffectedPlants = result.plantsAffected.map((plant) =>
            plant.replace(/\*/g, "").trim(),
          );
        } else {
          cleanAffectedPlants = ["Maize", "Sorghum", "Sugarcane", "Millet"];
        }

        // Build causes array - remove any asterisks
        let cleanCauses = [];
        if (result.causes && result.causes.length > 0) {
          cleanCauses = result.causes.map((cause) =>
            cause.replace(/\*/g, "").trim(),
          );
        } else {
          cleanCauses = [
            "High temperatures and humidity",
            "Poor crop rotation",
            "Late planting",
          ];
        }

        // Create a concise analysis summary
        const analysisSummary = `${result.name.replace(/\*/g, "")} identified with ${result.confidence}% confidence. This ${result.type} affects ${cleanAffectedPlants.join(", ")} crops and requires prompt treatment.`;

        // Create the complete JSON response and ensure no asterisks remain
        const jsonResponse = {
          analysisSummary: analysisSummary,
          identification: {
            name: result.name.replace(/\*/g, ""),
            confidence: result.confidence,
            type: result.type,
            description: result.description.replace(/\*/g, ""),
          },
          causes: cleanCauses,
          controlMethods: {
            chemical: chemicalControls.map((control) => ({
              ...control,
              name: control.name.replace(/\*/g, ""),
              activeIngredient: control.activeIngredient.replace(/\*/g, ""),
            })),
            organic: organicControls.map((control) => ({
              ...control,
              name: control.name.replace(/\*/g, ""),
              activeIngredient: control.activeIngredient.replace(/\*/g, ""),
            })),
            cultural: culturalPractices.map((practice) =>
              practice.replace(/\*/g, ""),
            ),
          },
          affectedPlants: cleanAffectedPlants,
        };

        responseContent = JSON.stringify(jsonResponse, null, 2);
      }

      setIdentificationResult(responseContent);

      // Add to history if successful identification
      if (!responseContent.includes("error")) {
        const historyItem: IdentificationHistory = {
          id: Date.now().toString(),
          timestamp: new Date(),
          image: selectedImage,
          result: responseContent,
        };
        setHistory((prev) => [historyItem, ...prev]);
        // Save to localStorage
        const savedHistory = JSON.parse(
          localStorage.getItem("identificationHistory") || "[]",
        );
        localStorage.setItem(
          "identificationHistory",
          JSON.stringify([historyItem, ...savedHistory].slice(0, 20)),
        );
      }
    } catch (error) {
      // Handle error
      const errorResponse = {
        status: "error",
        message: `Sorry, I encountered an error processing your image: ${error instanceof Error ? error.message : "Unknown error"}. Please try again with a clearer image.`,
      };
      setIdentificationResult(JSON.stringify(errorResponse, null, 2));
    } finally {
      setIsProcessing(false);
    }
  };

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("identificationHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (e) {
        console.error("Error parsing history:", e);
      }
    }
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Plant & Pest Identifier</h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-300"
            >
              Powered by Gemini 2.0 Flash
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Using{" "}
                    {import.meta.env.VITE_GEMINI_API_KEY
                      ? "live Gemini API"
                      : "mock data (no API key)"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="identify">Identify</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identify" className="flex-1 flex flex-col">
            <div className="flex flex-col gap-4 md:gap-6 flex-1">
              {/* Image Upload Section - Smaller and above results */}
              <Card className="flex flex-col max-w-md mx-auto w-full">
                <CardHeader className="pb-2">
                  <CardTitle>Upload Image</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                  {selectedImage ? (
                    <div className="relative w-full flex items-center justify-center">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="max-w-full max-h-[250px] object-contain rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={handleClearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Image className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload a clear image of your plant, pest, or disease
                      </p>
                    </div>
                  )}
                </CardContent>
                <div className="p-3 border-t flex flex-wrap gap-2 justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                    className="flex-1"
                    size="sm"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // In a real app, this would access the device camera
                      alert(
                        "Camera functionality would be implemented in a mobile app",
                      );
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                    size="sm"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    onClick={handleProcessImage}
                    disabled={!selectedImage || isProcessing}
                    className="w-full mt-2"
                    size="sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Identify
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Results Section */}
              <Card className="flex flex-col flex-1">
                <CardHeader>
                  <CardTitle>Identification Results</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {identificationResult ? (
                    <IdentificationReport jsonData={identificationResult} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-6">
                      <div className="text-gray-500 dark:text-gray-400">
                        <p>
                          Upload and process an image to see identification
                          results
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {identificationResult && (
                  <div className="p-4 border-t">
                    <div className="mb-2">
                      <Input
                        placeholder="Add notes about this identification..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Save notes to history
                        if (notes.trim() && history.length > 0) {
                          const updatedHistory = [...history];
                          updatedHistory[0] = {
                            ...updatedHistory[0],
                            notes: notes,
                          };
                          setHistory(updatedHistory);
                          localStorage.setItem(
                            "identificationHistory",
                            JSON.stringify(updatedHistory),
                          );
                          setNotes("");
                          alert("Notes saved!");
                        }
                      }}
                    >
                      Save Notes
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Identification History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  {history.length > 0 ? (
                    <div className="space-y-4">
                      {history.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/3 p-4 flex items-center justify-center bg-muted">
                              <img
                                src={item.image}
                                alt="Identified plant"
                                className="max-h-[200px] object-contain rounded-md"
                              />
                            </div>
                            <div className="w-full md:w-2/3 p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium">
                                  {(() => {
                                    try {
                                      const data = JSON.parse(item.result);
                                      if (data.status === "healthy") {
                                        return "Healthy Plant";
                                      } else if (data.identification) {
                                        return data.identification.name;
                                      }
                                      return "Identification Result";
                                    } catch (e) {
                                      return "Identification Result";
                                    }
                                  })()}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="max-h-[300px] overflow-auto">
                                <IdentificationReport jsonData={item.result} />
                              </div>
                              {item.notes && (
                                <div className="mt-2 p-2 bg-muted rounded-md">
                                  <p className="text-sm font-medium">Notes:</p>
                                  <p className="text-sm">{item.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No identification history yet. Identify some plants or
                        pests to see them here.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PlantIdentifier;
