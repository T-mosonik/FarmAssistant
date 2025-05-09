import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Leaf, Sprout } from "lucide-react";

interface PestRecord {
  id: string;
  name: string;
  date: string;
  location: string;
  affectedPlants: string;
  treatmentPlan: string;
}

const PestDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state?.record as PestRecord;

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Record Not Found</h2>
              <p className="text-muted-foreground">
                The pest record you're looking for doesn't exist or was deleted.
              </p>
              <Button onClick={() => navigate("/garden-identifier")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Garden Identifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/garden-identifier")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Pest Details</h1>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{record.name}</CardTitle>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {record.date}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{record.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Leaf className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Affected Plants</h3>
                  <p>{record.affectedPlants}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Sprout className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Treatment Plan</h3>
                  <p className="whitespace-pre-wrap">{record.treatmentPlan}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Date Recorded</h3>
                  <p>{record.date}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="font-medium mb-2">Notes & Observations</h3>
            <p className="text-muted-foreground">
              No additional notes have been added for this record.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PestDetails;
