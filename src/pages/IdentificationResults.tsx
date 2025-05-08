import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bug, Leaf, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import IdentificationReport from "@/components/ai-chat/IdentificationReport";

interface LocationState {
  identificationData: string;
  imageUrl: string;
}

const IdentificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // If no data was passed, redirect back to the identifier
  if (!state?.identificationData) {
    React.useEffect(() => {
      navigate("/plant-identifier");
    }, [navigate]);
    return null;
  }

  const handleBack = () => {
    navigate("/plant-identifier");
  };

  // Parse the identification data to display in the header
  let identificationName = "";
  let confidenceLevel = 0;
  let identificationType = "pest";

  try {
    const data = JSON.parse(state.identificationData);
    identificationName = data.identification?.name || "";
    confidenceLevel = data.identification?.confidence || 0;
    identificationType = data.identification?.type || "pest";
  } catch (error) {
    console.error("Error parsing identification data:", error);
  }

  // Determine threat level based on confidence
  const getThreatLevel = () => {
    if (confidenceLevel > 90) return "High Threat";
    if (confidenceLevel > 70) return "Medium Threat";
    return "Low Threat";
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background dark:bg-gray-900">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Identification Results</h1>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          {/* Header with pest name and confidence */}
          <div className="bg-black dark:bg-gray-800 p-6 rounded-t-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {identificationType === "pest" ? (
                  <Bug className="mr-2 h-5 w-5 text-red-500" />
                ) : (
                  <Leaf className="mr-2 h-5 w-5 text-green-500" />
                )}
                <h2 className="text-xl font-bold text-white">
                  {identificationType === "pest" ? "Pest" : "Plant"}{" "}
                  Identification Results
                </h2>
              </div>
              <Badge
                className={`px-3 py-1 ${
                  getThreatLevel() === "High Threat"
                    ? "bg-red-500"
                    : getThreatLevel() === "Medium Threat"
                      ? "bg-amber-500"
                      : "bg-green-500"
                }`}
              >
                {getThreatLevel()}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {identificationName}
            </h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-300 mr-2">AI Confidence:</span>
              <Progress
                value={confidenceLevel}
                className="h-2 flex-1 bg-gray-700"
              />
              <span className="text-sm text-gray-300 ml-2">
                {confidenceLevel}%
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black dark:bg-gray-800 p-6 rounded-b-lg border-x border-b border-gray-700">
            <div className="md:col-span-1">
              {state.imageUrl && (
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="relative w-full">
                    <img
                      src={state.imageUrl}
                      alt="Analyzed plant or pest"
                      className="w-full object-contain rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={handleBack}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="bg-gray-900 dark:bg-gray-900 p-6 rounded-lg border border-gray-700">
                <IdentificationReport jsonData={state.identificationData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default IdentificationResults;
