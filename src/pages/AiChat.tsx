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

        let result;
        // Check if API key is available
        if (import.meta.env.VITE_GEMINI_API_KEY) {
          result = await processImageWithGemini(selectedImage, prompt);
        } else {
          // Use mock data if no API key is available
          console.warn("No Gemini API key found, using mock data");
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
          result = getMockIdentificationResult();
        }

        setIdentificationResult(result);

        const responseMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: `I've identified this as a ${result.name} with ${result.confidence}% confidence. ${result.description}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, responseMessage]);
      } else {
        // Text-only response
        const responseMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content:
            "I can help identify plants, pests, and diseases from images. Please upload a photo for me to analyze.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, responseMessage]);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat Section */}
          <div className="lg:col-span-2 flex flex-col border rounded-lg overflow-hidden bg-card">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
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
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
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
              <div className="flex space-x-2">
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

          {/* Results Panel */}
          <div className="hidden lg:block">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Identification Results</CardTitle>
              </CardHeader>
              <CardContent>
                {identificationResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        {identificationResult.name}
                      </h3>
                      <Badge className="flex items-center gap-1">
                        {getTypeIcon(identificationResult.type)}
                        {identificationResult.type.charAt(0).toUpperCase() +
                          identificationResult.type.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{
                            width: `${identificationResult.confidence}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {identificationResult.confidence}%
                      </span>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {identificationResult.description}
                      </p>
                    </div>

                    {identificationResult.recommendations && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {identificationResult.recommendations.map(
                            (rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{rec}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center text-muted-foreground">
                    <div className="mb-4 p-4 rounded-full bg-muted">
                      <Camera className="h-8 w-8" />
                    </div>
                    <p>
                      Upload an image to identify plants, pests, or diseases
                    </p>
                    <p className="text-sm mt-2">Results will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiChat;
