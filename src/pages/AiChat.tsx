import React, { useState, useRef, useEffect } from "react";
import {
  processImageWithGemini,
  getMockIdentificationResult,
} from "@/lib/gemini";
import {
  Camera,
  Image,
  Send,
  Loader2,
  X,
  Leaf,
  Bug,
  AlertCircle,
  Info,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import IdentificationReport from "@/components/ai-chat/IdentificationReport";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
}

interface IdentificationResult {
  name: string;
  confidence: number;
  type: "plant" | "pest" | "disease";
  description: string;
  recommendations?: string[];
  causes?: string[];
  plantsAffected?: string[];
  controlMeasures?: {
    chemical?: {
      name: string;
      brands: string[];
      safetyGuidelines: string[];
    }[];
    organic?: {
      name: string;
      brands: string[];
      safetyGuidelines: string[];
    }[];
  };
}

const AiChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Welcome to AIdentify! Upload or take a photo of your crops, and I'll help identify plants, pests, or diseases.",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [identificationResult, setIdentificationResult] =
    useState<IdentificationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Send message with or without image
  const handleSendMessage = async () => {
    if ((!inputValue && !selectedImage) || isProcessing) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      if (selectedImage) {
        // Process image with Gemini
        const prompt = inputValue || "Identify what's in this image";
        const userCountry = "United States"; // This could be made dynamic based on user profile

        let result;
        // Check if API key is available
        if (import.meta.env.VITE_GEMINI_API_KEY) {
          result = await processImageWithGemini(
            selectedImage,
            prompt,
            userCountry,
          );
        } else {
          // Use mock data if no API key is available
          console.warn("No Gemini API key found, using mock data");
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
          result = getMockIdentificationResult();
        }

        setIdentificationResult(result);

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
        } else {
          // Create a structured JSON response with bullet points instead of asterisks
          const culturalPractices = [
            "Practice crop rotation with non-cereal crops",
            "Plant early to avoid peak pest populations",
            "Remove and destroy infested plant debris after harvest",
            "Encourage natural enemies by planting flowering plants nearby",
            "Destroy crop residues after harvest to reduce pest carryover",
          ];

          // Build chemical controls array
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
                method:
                  "Apply as a foliar spray, ensuring thorough coverage. Repeat after 7-10 days if infestation persists.",
                safeDays: 14,
                safety:
                  "Wear protective equipment during application. Avoid contact with skin and eyes.",
              });
            });
          }

          // Build organic controls array
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
                method:
                  "Apply as a foliar spray, ensuring thorough coverage. Repeat every 5-7 days.",
                safeDays: 0,
                safety:
                  "Wear gloves and eye protection. Avoid spraying during hot, sunny conditions.",
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

          // Create the complete JSON response and ensure no asterisks remain
          const jsonResponse = {
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
                method: control.method.replace(/\*/g, ""),
                safety: control.safety.replace(/\*/g, ""),
                activeIngredient: control.activeIngredient.replace(/\*/g, ""),
                applicationRate: control.applicationRate.replace(/\*/g, ""),
              })),
              organic: organicControls.map((control) => ({
                ...control,
                name: control.name.replace(/\*/g, ""),
                method: control.method.replace(/\*/g, ""),
                safety: control.safety.replace(/\*/g, ""),
                activeIngredient: control.activeIngredient.replace(/\*/g, ""),
                applicationRate: control.applicationRate.replace(/\*/g, ""),
              })),
              cultural: culturalPractices.map((practice) =>
                practice.replace(/\*/g, ""),
              ),
            },
            affectedPlants: cleanAffectedPlants,
          };

          responseContent = JSON.stringify(jsonResponse, null, 2);
        }

        const responseMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: responseContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, responseMessage]);
      } else {
        // Text-only response - check if agriculture related
        if (!isAgricultureRelated(inputValue)) {
          const errorMessage: Message = {
            id: Date.now().toString(),
            type: "assistant",
            content:
              "Your request is not Farming or Gardening related. I'm designed to help with agricultural topics only.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } else {
          // Agriculture-related query
          const responseMessage: Message = {
            id: Date.now().toString(),
            type: "assistant",
            content:
              "I can help with your farming question, but for plant, pest, or disease identification, please upload a photo for me to analyze.",
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
      setSelectedImage(null);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Scroll to bottom after new messages
      setTimeout(scrollToBottom, 100);
    }

    // Scroll to bottom immediately after sending
    setTimeout(scrollToBottom, 100);
  };

  // Get icon based on identification type
  const getTypeIcon = (type: "plant" | "pest" | "disease") => {
    switch (type) {
      case "plant":
        return <Leaf className="h-5 w-5 text-green-500" />;
      case "pest":
        return <Bug className="h-5 w-5 text-orange-500" />;
      case "disease":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Leaf className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">AI Chat (AIdentify)</h1>
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

        <div className="grid grid-cols-1 gap-4 md:gap-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
          {/* Chat Section */}
          <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-3 md:p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {message.image && (
                        <div className="mb-2">
                          <img
                            src={message.image}
                            alt="Uploaded"
                            className="max-h-60 rounded-md"
                          />
                        </div>
                      )}
                      {message.type === "assistant" &&
                      message.content.startsWith("{") ? (
                        <IdentificationReport jsonData={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
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
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t bg-background">
              {selectedImage && (
                <div className="relative inline-block mb-2">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-20 rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleClearImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUploadClick}
                  disabled={isProcessing}
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    // In a real app, this would access the device camera
                    alert(
                      "Camera functionality would be implemented in a mobile app",
                    );
                  }}
                  disabled={isProcessing}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your crops..."
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
                  onClick={handleSendMessage}
                  disabled={(!inputValue && !selectedImage) || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiChat;
