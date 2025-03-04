import { useState, useEffect } from "react";

export interface WeatherForecast {
  day: string;
  condition: string;
  highTemp: number;
  lowTemp: number;
}

export interface WeatherData {
  location: string;
  currentTemp: number;
  condition: string;
  highTemp: number;
  lowTemp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: WeatherForecast[];
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    precipitation: string;
    weather_code: string;
    wind_speed_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    weather_code: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

// Map weather codes to conditions
const weatherCodeToCondition = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 56 && code <= 57) return "Freezing Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 66 && code <= 67) return "Freezing Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
};

// Format day names
const formatDay = (dateString: string, index: number): string => {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

// Fetch weather data from Open-Meteo API
export const fetchWeatherData = async (
  latitude: number,
  longitude: number,
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3`,
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();

    // Process forecast data
    const forecasts: WeatherForecast[] = data.daily.time.map((time, index) => ({
      day: formatDay(time, index),
      condition: weatherCodeToCondition(data.daily.weather_code[index]),
      highTemp: Math.round(data.daily.temperature_2m_max[index]),
      lowTemp: Math.round(data.daily.temperature_2m_min[index]),
    }));

    // Create weather data object
    return {
      location: "Your Farm", // This would be replaced with geocoding in a full implementation
      currentTemp: Math.round(data.current.temperature_2m),
      condition: weatherCodeToCondition(data.current.weather_code),
      highTemp: Math.round(data.daily.temperature_2m_max[0]),
      lowTemp: Math.round(data.daily.temperature_2m_min[0]),
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      precipitation: data.current.precipitation,
      forecast: forecasts,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

// Hook to get weather data
export const useWeather = (
  latitude: number = 40.7128,
  longitude: number = -74.006,
) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const data = await fetchWeatherData(
                  position.coords.latitude,
                  position.coords.longitude,
                );
                setWeatherData(data);
                setIsLoading(false);
              } catch (err) {
                console.error(
                  "Error fetching weather with user location:",
                  err,
                );
                // Fallback to default location
                const data = await fetchWeatherData(latitude, longitude);
                setWeatherData(data);
                setIsLoading(false);
              }
            },
            async (err) => {
              console.warn("Geolocation error:", err);
              // Fallback to default location
              const data = await fetchWeatherData(latitude, longitude);
              setWeatherData(data);
              setIsLoading(false);
            },
          );
        } else {
          // Geolocation not supported, use default location
          const data = await fetchWeatherData(latitude, longitude);
          setWeatherData(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Weather data error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load weather data",
        );
        setIsLoading(false);
      }
    };

    getWeatherData();

    // Refresh weather data every 30 minutes
    const intervalId = setInterval(getWeatherData, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [latitude, longitude]);

  return { weatherData, isLoading, error };
};
