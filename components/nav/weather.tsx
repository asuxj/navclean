"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Loader2 } from "lucide-react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
          );
          const data = await res.json();
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
          });
        } catch (e) {
          console.error("Weather fetch failed", e);
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false); // Permission denied or error
      }
    );
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="h-5 w-5 text-yellow-400" />;
    if (code <= 3) return <Cloud className="h-5 w-5 text-gray-300" />;
    if (code <= 48) return <CloudFog className="h-5 w-5 text-gray-400" />;
    if (code <= 67) return <CloudRain className="h-5 w-5 text-blue-400" />;
    if (code <= 77) return <CloudSnow className="h-5 w-5 text-white" />;
    if (code <= 99) return <CloudLightning className="h-5 w-5 text-purple-400" />;
    return <Sun className="h-5 w-5 text-yellow-400" />;
  };

  if (loading) return <div className="h-8 w-8 animate-pulse bg-white/10 rounded-full" />;
  if (error || !weather) return null; // 隐藏如果无法获取位置

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-sm transition-transform hover:scale-105 cursor-default mt-4">
      {getWeatherIcon(weather.weatherCode)}
      <span className="text-white font-medium text-sm">{weather.temperature}°C</span>
    </div>
  );
}