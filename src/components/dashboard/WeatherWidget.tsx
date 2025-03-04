import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Cloud,
  CloudRain,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Snowflake,
  CloudFog,
  CloudLightning,
} from "lucide-react";
import { WeatherData, useWeather } from "@/lib/weather";

interface WeatherWidgetProps {
  weatherData?: WeatherData;
  isLoading?: boolean;
  error?: string;
  latitude?: number;
  longitude?: number;
}

const WeatherWidget = ({
  weatherData,
  isLoading: externalIsLoading,
  error: externalError,
  latitude,
  longitude,
}: WeatherWidgetProps) => {
  // Use the weather hook if no external data is provided
  const {
    weatherData: hookWeatherData,
    isLoading: hookIsLoading,
    error: hookError,
  } = useWeather(latitude, longitude);

  // Use provided data or data from the hook
  const data = weatherData || hookWeatherData;
  const isLoading =
    externalIsLoading !== undefined ? externalIsLoading : hookIsLoading;
  const error = externalError || hookError;
  // Function to determine which weather icon to display based on condition
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (
      conditionLower.includes("rain") ||
      conditionLower.includes("shower") ||
      conditionLower.includes("drizzle")
    ) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (conditionLower.includes("snow")) {
      return <Snowflake className="h-8 w-8 text-blue-300" />;
    } else if (conditionLower.includes("fog")) {
      return <CloudFog className="h-8 w-8 text-gray-400" />;
    } else if (conditionLower.includes("thunder")) {
      return <CloudLightning className="h-8 w-8 text-purple-500" />;
    } else if (
      conditionLower.includes("cloud") ||
      conditionLower.includes("overcast")
    ) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    } else if (
      conditionLower.includes("sun") ||
      conditionLower.includes("clear") ||
      conditionLower.includes("fair")
    ) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-[350px] h-[200px] bg-background">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse flex flex-col w-full space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-[350px] h-[200px] bg-background">
        <CardContent className="p-6">
          <div className="text-destructive flex flex-col items-center justify-center h-full">
            <p>Unable to load weather data</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[350px] h-[200px] overflow-hidden bg-background">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{data?.location || "Loading location..."}</span>
          <span className="text-sm text-muted-foreground">
            Updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {data && (
          <>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {getWeatherIcon(data.condition)}
                <div className="ml-3">
                  <div className="text-3xl font-bold">{data.currentTemp}°C</div>
                  <div className="text-sm text-muted-foreground">
                    {data.condition}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  H: {data.highTemp}° L: {data.lowTemp}°
                </div>
                <div className="flex items-center justify-end mt-1">
                  <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="text-xs">{data.humidity}%</span>
                </div>
                <div className="flex items-center justify-end mt-1">
                  <Wind className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-xs">{data.windSpeed} kph</span>
                </div>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between text-xs">
              {data.forecast.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="font-medium">{day.day}</span>
                  {getWeatherIcon(day.condition)}
                  <span>{day.highTemp}°</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
