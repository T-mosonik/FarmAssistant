import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Image,
  Search,
  Calendar,
  Send,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  processImageWithGemini,
  GeminiIdentificationResult,
} from "@/lib/gemini";
import IdentificationReport from "@/components/ai-chat/IdentificationReport";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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

  // Form state for tracking new pests/diseases
  const [trackingForm, setTrackingForm] = useState({
    date: "",
    name: "",
    location: "",
    affectedPlants: "",
    treatmentPlan: "",
  });

  // History tab filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Welcome to the FarmAssistant AI Chat! I'm here to help with your farming and gardening questions. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if text is related to farming/gardening
  const isAgricultureRelated = (text: string): boolean => {
    const agricultureKeywords = [
      "farm",
      "crop",
      "plant",
      "soil",
      "seed",
      "harvest",
      "fertilizer",
      "pesticide",
      "irrigation",
      "garden",
      "grow",
      "cultivate",
      "agriculture",
      "organic",
      "compost",
      "weed",
      "pest",
      "disease",
      "fruit",
      "vegetable",
      "flower",
      "tree",
      "shrub",
      "greenhouse",
      "hydroponics",
      "livestock",
      "cattle",
      "poultry",
      "dairy",
      "field",
      "yield",
      "rotation",
      "season",
      "climate",
      "weather",
      "drought",
      "flood",
      "nutrient",
      "mulch",
      "prune",
    ];

    const lowerText = text.toLowerCase();
    return agricultureKeywords.some((keyword) => lowerText.includes(keyword));
  };

  // Clean response text
  const cleanResponseText = (text: string): string => {
    // Remove asterisks
    let cleaned = text.replace(/\*/g, "");
    // Remove any markdown-style headers
    cleaned = cleaned.replace(/^#+\s+.*$/gm, "");
    // Remove excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    // Remove any "disclaimer" or "note" paragraphs
    cleaned = cleaned.replace(/\n(Note:|Disclaimer:).*$/gs, "");
    return cleaned.trim();
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue || isProcessing) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      // Process with Gemini API - let the AI check if it's agriculture-related
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const currentUserCountry = userCountry;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an agricultural assistant for a farming app called FarmAssistant. First, determine if the user's question is related to farming, agriculture, gardening, or any related agricultural topics. If it is NOT related to agriculture, respond with EXACTLY: "Your request is not related to farming or agriculture. I'm designed to help with agricultural topics only." and nothing else.

If the question IS related to agriculture, answer it in a helpful, accurate, and detailed way. Provide specific, actionable advice when possible. The user is located in ${currentUserCountry}, so tailor your advice to that region's climate, growing conditions, and available resources. Format your response in a professional, concise manner without excessive paragraphs. Avoid using asterisks for emphasis. If you don't know the answer, suggest resources or alternative approaches. Here is the user's question: ${inputValue}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.5,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 800,
              },
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Gemini API error: ${errorData.error?.message || response.statusText}`,
          );
        }

        const data = await response.json();
        let responseContent = data.candidates[0].content.parts[0].text;

        // Clean the response text
        responseContent = cleanResponseText(responseContent);

        const responseMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: responseContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, responseMessage]);
      } catch (error) {
        console.error("Error calling Gemini API:", error);

        // Fallback to agricultural responses from the library
        const { findAgricultureResponse } = await import(
          "@/lib/agricultural-responses"
        );

        // Check if the query is agriculture-related as a fallback
        if (!isAgricultureRelated(inputValue)) {
          const errorMessage: Message = {
            id: Date.now().toString(),
            type: "assistant",
            content:
              "Your request is not related to farming or agriculture. I'm designed to help with agricultural topics only.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } else {
          const response =
            findAgricultureResponse(inputValue) ||
            "I'm sorry, I couldn't find specific information about that agricultural topic. Could you try rephrasing your question?";

          const responseMessage: Message = {
            id: Date.now().toString(),
            type: "assistant",
            content: response,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, responseMessage]);
        }
      }
    } catch (error) {
      // Handle error
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Sorry, I encountered an error processing your request: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

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
          affectedPlants:
            result.plantsAffected && Array.isArray(result.plantsAffected)
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
        plantsAffected: null,
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
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Garden Pest & Disease Identifier</h1>
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
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-12 flex flex-col items-center justify-center w-full max-w-[80%] min-w-[60rem] mx-auto">
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
                                  analysisResult.controlMeasures?.organic || [],
                                cultural:
                                  analysisResult.controlMeasures?.cultural ||
                                  [],
                              },
                              affectedPlants:
                                analysisResult.plantsAffected &&
                                Array.isArray(analysisResult.plantsAffected)
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
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();

                  // Create new record
                  const newRecord: PestRecord = {
                    id: Date.now().toString(),
                    name: trackingForm.name,
                    date:
                      trackingForm.date ||
                      new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }),
                    location: trackingForm.location,
                    affectedPlants: trackingForm.affectedPlants,
                    treatmentPlan: trackingForm.treatmentPlan,
                  };

                  // Add to records
                  setPestRecords((prev) => [newRecord, ...prev]);

                  // Reset form
                  setTrackingForm({
                    date: "",
                    name: "",
                    location: "",
                    affectedPlants: "",
                    treatmentPlan: "",
                  });

                  // Switch to history tab
                  setActiveTab("history");
                }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <Input
                    type="text"
                    placeholder="April 4th, 2025"
                    value={trackingForm.date}
                    onChange={(e) =>
                      setTrackingForm({ ...trackingForm, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pest/Disease Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Japanese Beetle, Powdery Mildew"
                    value={trackingForm.name}
                    onChange={(e) =>
                      setTrackingForm({ ...trackingForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Back garden, tomato bed"
                    value={trackingForm.location}
                    onChange={(e) =>
                      setTrackingForm({
                        ...trackingForm,
                        location: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Affected Plants
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Tomatoes, peppers"
                    value={trackingForm.affectedPlants}
                    onChange={(e) =>
                      setTrackingForm({
                        ...trackingForm,
                        affectedPlants: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Treatment Plan
                  </label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your planned treatment method"
                    value={trackingForm.treatmentPlan}
                    onChange={(e) =>
                      setTrackingForm({
                        ...trackingForm,
                        treatmentPlan: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Save Record
                </Button>
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
                          <h3 className="font-medium text-lg">{record.name}</h3>
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
                              onClick={() => {
                                navigate(`/pest-details/${record.id}`, {
                                  state: { record },
                                });
                              }}
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
              <div className="flex-1 overflow-y-auto">
                <div className="w-full max-w-2xl mx-auto">
                  {messages.length === 1 && (
                    <p className="text-center text-muted-foreground mb-8">
                      Ask about farming, gardening, or pest control...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about farming, gardening, or pest control..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GardenIdentifier;
