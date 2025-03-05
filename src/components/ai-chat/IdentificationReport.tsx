import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Leaf, Bug, AlertCircle, Shield, Sprout } from "lucide-react";

interface IdentificationReportProps {
  jsonData: string;
}

const IdentificationReport: React.FC<IdentificationReportProps> = ({
  jsonData,
}) => {
  try {
    // Parse JSON and ensure no asterisks remain in any string fields
    const data = JSON.parse(jsonData);

    // Function to recursively remove asterisks from all string values in an object
    const removeAsterisks = (obj) => {
      if (!obj || typeof obj !== "object") return obj;

      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/\*/g, "");
        } else if (Array.isArray(obj[key])) {
          obj[key] = obj[key].map((item) => {
            if (typeof item === "string") return item.replace(/\*/g, "");
            if (typeof item === "object") return removeAsterisks(item);
            return item;
          });
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          obj[key] = removeAsterisks(obj[key]);
        }
      });

      return obj;
    };

    // Apply asterisk removal to the entire data object
    removeAsterisks(data);

    // Handle healthy plant case
    if (data.status === "healthy") {
      return (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Healthy Plant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.message}</p>
          </CardContent>
        </Card>
      );
    }

    // Handle pest/disease identification
    const { identification, causes, controlMethods, affectedPlants } = data;

    return (
      <div className="space-y-4">
        {/* Identification Section */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">
                {identification.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={`${identification.type === "pest" ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-red-100 text-red-800 border-red-300"}`}
              >
                {identification.type === "pest" ? (
                  <Bug className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {identification.type.charAt(0).toUpperCase() +
                  identification.type.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex items-center mb-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
              <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${identification.confidence > 90 ? "bg-green-500" : identification.confidence > 75 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${identification.confidence}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium">
                {identification.confidence}% confidence
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300">
              {identification.description}
            </p>

            {/* Causes Section */}
            {causes && causes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Causes
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {causes.map((cause, index) => (
                    <li
                      key={index}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control Methods Section */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Control Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            {/* Chemical Controls */}
            {controlMethods.chemical && controlMethods.chemical.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                  Chemical Control
                </h3>
                {controlMethods.chemical.map((control, index) => (
                  <div
                    key={index}
                    className="mb-3 last:mb-0 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {control.name}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Active Ingredient:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.activeIngredient}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Application Rate:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.applicationRate}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Method:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.method}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Safe Days:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.safeDays}
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="font-bold text-yellow-700 dark:text-yellow-400">
                          Safety:
                        </p>
                        <p className="text-yellow-600 dark:text-yellow-500">
                          {control.safety}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Organic Controls */}
            {controlMethods.organic && controlMethods.organic.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  Organic Control
                </h3>
                {controlMethods.organic.map((control, index) => (
                  <div
                    key={index}
                    className="mb-3 last:mb-0 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {control.name}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Active Ingredient:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.activeIngredient}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Application Rate:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.applicationRate}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Method:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.method}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Safe Days:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {control.safeDays}
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="font-bold text-yellow-700 dark:text-yellow-400">
                          Safety:
                        </p>
                        <p className="text-yellow-600 dark:text-yellow-500">
                          {control.safety}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cultural Controls */}
            {controlMethods.cultural && controlMethods.cultural.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  Cultural Control
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {controlMethods.cultural.map((practice, index) => (
                    <li
                      key={index}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Affected Plants Section */}
        {affectedPlants && affectedPlants.length > 0 && (
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                Affected Plants
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-wrap gap-2">
                {affectedPlants.map((plant, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 py-1.5"
                  >
                    {plant}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    // Handle parsing errors
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400">
            Error Parsing Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            There was an error displaying the identification report. Please try
            again.
          </p>
        </CardContent>
      </Card>
    );
  }
};

export default IdentificationReport;
