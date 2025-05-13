import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Leaf,
  Clipboard,
  FileText,
} from "lucide-react";
import { PestRecord } from "@/lib/database";

const PestDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Get the pest record from location state
  const pestRecord = location.state?.pestRecord as PestRecord;

  // If no pest record is found, show a not found message
  if (!pestRecord) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-2xl font-bold mb-4">Pest Record Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The pest record you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/garden-identifier")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Garden Identifier
        </Button>
      </div>
    );
  }

  // Format the date for display
  const formattedDate = new Date(pestRecord.date).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/garden-identifier")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Pest Details</h1>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{pestRecord.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" /> Location
                </h3>
                <p className="text-muted-foreground mt-1">
                  {pestRecord.location}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-primary" /> Affected Plants
                </h3>
                <p className="text-muted-foreground mt-1">
                  {pestRecord.affected_plants}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-primary" /> Treatment
                  Plan
                </h3>
                <p className="text-muted-foreground mt-1">
                  {pestRecord.treatment_plan}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" /> Notes
                </h3>
                <p className="text-muted-foreground mt-1">
                  {pestRecord.notes || "No additional notes"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Recommended Actions</h3>
            <div className="bg-muted p-4 rounded-md">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Continue monitoring affected plants for signs of improvement
                  or worsening
                </li>
                <li>Follow the treatment plan consistently for best results</li>
                <li>
                  Consider preventive measures for unaffected plants nearby
                </li>
                <li>
                  Document the effectiveness of treatments for future reference
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PestDetails;
