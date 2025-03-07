import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Camera,
  History,
  Leaf,
  Bug,
  AlertCircle,
} from "lucide-react";

const AiHub = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Assistant Hub</h1>
          <p className="text-muted-foreground mt-1">
            Access powerful AI tools to help with your farming needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant & Pest Identifier Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Plant & Pest Identifier
                </CardTitle>
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Camera className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardDescription>
                Identify plants, pests, and diseases from photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex items-center">
                  <Leaf className="h-5 w-5 text-green-500 mr-1" />
                  <span>Plants</span>
                </div>
                <div className="flex items-center">
                  <Bug className="h-5 w-5 text-orange-500 mr-1" />
                  <span>Pests</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-1" />
                  <span>Diseases</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Upload or take photos of your crops to get instant
                identification and treatment recommendations.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => navigate("/plant-identifier")}
              >
                Open Identifier
              </Button>
            </CardFooter>
          </Card>

          {/* AI Chat Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Agricultural AI Chat</CardTitle>
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardDescription>
                Get expert farming and gardening advice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Chat with our AI assistant about:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Crop management techniques</li>
                <li>Soil health and fertilization</li>
                <li>Pest and disease control</li>
                <li>Irrigation and water management</li>
                <li>Seasonal planting advice</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => navigate("/ai-chat-new")}
              >
                Start Chatting
              </Button>
            </CardFooter>
          </Card>

          {/* History & Records Card */}
          <Card className="hover:shadow-md transition-shadow md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Identification History
                </CardTitle>
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardDescription>
                Access your past plant and pest identifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                View your identification history, add notes, and track the
                health of your crops over time. All your previous
                identifications are stored locally on your device for easy
                reference.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  navigate("/plant-identifier");
                  // After navigation, switch to history tab
                  setTimeout(() => {
                    const historyTab =
                      document.querySelector('[value="history"]');
                    if (historyTab) {
                      (historyTab as HTMLElement).click();
                    }
                  }, 100);
                }}
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiHub;
