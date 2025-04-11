import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Leaf,
  Bug,
  AlertCircle,
  Shield,
  Sprout,
  AlertTriangle,
  Info,
  CheckCircle2,
  Droplets,
} from "lucide-react";

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
        <div className="text-green-700 dark:text-green-400">
          <p className="font-medium mb-2">Healthy Plant</p>
          <p>{data.message}</p>
        </div>
      );
    }

    // Handle error case
    if (data.status === "error") {
      return (
        <div className="text-red-700 dark:text-red-400">
          <p className="font-medium mb-2">Error</p>
          <p>{data.message}</p>
        </div>
      );
    }

    // Handle pest/disease identification
    const { identification, causes, controlMethods, affectedPlants } = data;

    const type = identification?.type || "disease";

    return (
      <div className="space-y-4">
        {/* Identification Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            {type === "pest" ? (
              <Bug className="mr-2 h-5 w-5 text-red-500" />
            ) : (
              <Leaf className="mr-2 h-5 w-5 text-green-500" />
            )}
            {identification.name}
            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
              {identification.confidence}% confidence
            </Badge>
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {identification.description}
          </p>
        </div>

        {/* Causes Section */}
        {causes && causes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2 flex items-center">
              <Info className="mr-2 h-4 w-4 text-blue-500" />
              Causes
            </h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 pl-6 list-disc">
              {causes.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Control Methods Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Shield className="mr-2 h-4 w-4 text-purple-500" />
            Control Measures
          </h4>

          {/* Chemical Controls */}
          {controlMethods.chemical && controlMethods.chemical.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-red-100 dark:border-red-900">
              <h5 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center">
                <Droplets className="mr-2 h-4 w-4" />
                Chemical Control
              </h5>
              <div className="text-gray-700 dark:text-gray-300 space-y-3">
                {controlMethods.chemical.map((chemical, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="font-medium">{chemical.name}</div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Active Ingredient:
                      </span>{" "}
                      {chemical.activeIngredient}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Application Rate:
                      </span>{" "}
                      {chemical.applicationRate}
                    </div>
                    {chemical.methodPoints &&
                      chemical.methodPoints.length > 0 && (
                        <div className="text-sm mt-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Application Method:
                          </span>
                          <ul className="pl-5 list-disc mt-1 space-y-1">
                            {chemical.methodPoints.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {chemical.brands && chemical.brands.length > 0 && (
                      <div className="text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Available Brands:
                        </span>{" "}
                        {chemical.brands.join(", ")}
                      </div>
                    )}
                    {chemical.safeDays && (
                      <div className="text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Safe Days:
                        </span>{" "}
                        {chemical.safeDays} days before harvest
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organic Controls */}
          {controlMethods.organic && controlMethods.organic.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-green-100 dark:border-green-900">
              <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                <Sprout className="mr-2 h-4 w-4" />
                Organic Control
              </h5>
              <div className="text-gray-700 dark:text-gray-300 space-y-3">
                {controlMethods.organic.map((organic, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="font-medium">{organic.name}</div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Active Ingredient:
                      </span>{" "}
                      {organic.activeIngredient}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Application Rate:
                      </span>{" "}
                      {organic.applicationRate}
                    </div>
                    {organic.methodPoints &&
                      organic.methodPoints.length > 0 && (
                        <div className="text-sm mt-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Application Method:
                          </span>
                          <ul className="pl-5 list-disc mt-1 space-y-1">
                            {organic.methodPoints.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Practices */}
          {controlMethods.cultural && controlMethods.cultural.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900">
              <h5 className="font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Cultural Practices
              </h5>
              <ul className="text-gray-700 dark:text-gray-300 pl-5 list-disc space-y-1">
                {controlMethods.cultural.map((practice, index) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Affected Plants Section */}
        {affectedPlants && affectedPlants.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2 flex items-center">
              <Leaf className="mr-2 h-4 w-4 text-green-500" />
              Plants Affected
            </h4>
            <div className="flex flex-wrap gap-2">
              {affectedPlants.map((plant, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                >
                  {plant}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error parsing identification data:", error);
    return (
      <div className="text-red-600">
        <p>Error displaying identification results. Please try again.</p>
      </div>
    );
  }
};

export default IdentificationReport;
