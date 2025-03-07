import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
}

const AiChatNew = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Welcome to FarmAssistant AI Chat! I'm here to help with your farming and gardening questions. How can I assist you today?",
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

  // Get user's country from localStorage or default to Kenya
  const getUserCountry = (): string => {
    // Try to get from localStorage if user has set it in profile
    const profileData = localStorage.getItem("profileSettings");
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        if (profile.location) {
          return profile.location.split(",")[0].trim(); // Get first part of location which is usually the country
        }
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    }
    return "Kenya"; // Default country
  };

  // Clean response text
  const cleanResponseText = (text: string): string => {
    // Remove asterisks
    let cleaned = text.replace(/\*/g, "");

    // Remove any markdown-style headers (e.g., "# Title")
    cleaned = cleaned.replace(/^#+\s+.*$/gm, "");

    // Remove excessive newlines (more than 2 in a row)
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    // Remove any "disclaimer" or "note" paragraphs that often appear at the end
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
      // Let Gemini handle all requests without pre-filtering
      // Make a real API call to Gemini
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const userCountry = getUserCountry();

        if (!apiKey) {
          throw new Error(
            "Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.",
          );
        }

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

If the question IS related to agriculture, answer it in a helpful, accurate, and detailed way. Provide specific, actionable advice when possible. The user is located in ${userCountry}, so tailor your advice to that region's climate, growing conditions, and available resources. Format your response in a professional, concise manner without excessive paragraphs. Avoid using asterisks for emphasis. If you don't know the answer, suggest resources or alternative approaches. Here is the user's question: ${inputValue}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.5, // Lower temperature for more professional responses
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
        throw error;
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

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">AI Chat</h1>
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
                    Powered by Google's Gemini 2.0 Flash model for agricultural
                    assistance
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
          {/* Chat Section */}
          <Card className="flex flex-col border rounded-lg overflow-hidden bg-card">
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
            <CardContent className="p-3 md:p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about farming or gardening..."
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
                  disabled={!inputValue || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiChatNew;
