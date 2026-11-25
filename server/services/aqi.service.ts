import "server-only";
import { AirQualityCurrent, HourlyAirQualityForecast } from "@/types";
import { aqiProviderService } from "./aqi-provider.service";
import { calculateAqiCategory } from "@/server/utils/aqi-calculator";

export { calculateAqiCategory };

export class AqiService {
  async getCurrentAirQuality(
    lat = 28.6139,
    lon = 77.209,
    city = "New Delhi"
  ): Promise<AirQualityCurrent> {
    const data = await aqiProviderService.getCurrentAirQuality(lat, lon, city);

    return {
      aqi: data.indianAqi,
      category: data.indianCategory as AirQualityCurrent["category"],
      categoryLabel: data.indianCategoryLabel,
      dominantPollutant: data.dominantPollutant as AirQualityCurrent["dominantPollutant"],
      pollutants: {
        pm25: data.pollutants.pm25,
        pm10: data.pollutants.pm10,
        no2: data.pollutants.no2,
        o3: data.pollutants.o3,
        so2: data.pollutants.so2,
        co: data.pollutants.co,
      },
      timestamp: data.meta.recordedAt,
      location: {
        latitude: lat,
        longitude: lon,
        city,
        country: "India",
      },
      healthRecommendation: data.healthAdvisory.summary,
    };
  }

  async getHourlyForecast(lat = 28.6139, lon = 77.209): Promise<HourlyAirQualityForecast[]> {
    const forecast = await aqiProviderService.getAirQualityForecast(lat, lon, 1);
    return forecast.hourly.slice(0, 24).map((h) => ({
      time: h.time.split("T")[1]?.substring(0, 5) || h.time,
      aqi: h.indianAqi,
      category: h.indianCategory as HourlyAirQualityForecast["category"],
      pm25: h.pm25,
      pm10: h.pm10,
    }));
  }

  getHealthAdvisory(aqi: number): string {
    if (aqi <= 50) return "Air quality is ideal for outdoor activities.";
    if (aqi <= 100) return "Air quality is acceptable. Minor discomfort to extremely sensitive individuals.";
    if (aqi <= 200) return "Breathing discomfort to sensitive individuals. Reduce prolonged heavy outdoor exertion.";
    if (aqi <= 300) return "Wear an N95 mask outdoors. Run HEPA purifiers indoors and close windows.";
    return "Health alert: severe pollution. Avoid outdoor activities; operate air filtration continuously.";
  }
}

export const aqiService = new AqiService();
