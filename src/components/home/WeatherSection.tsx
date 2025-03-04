import React from "react";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import { useWeather } from "@/lib/weather";

const WeatherSection = () => {
  const { weatherData, isLoading, error } = useWeather();

  return (
    <div className="mb-6">
      <WeatherWidget
        weatherData={weatherData}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default WeatherSection;
