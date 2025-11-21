import { z } from "zod";

export const SensorEventSchema = z.object({
  sensorId: z.string().describe("Unique identifier for the sensor"),
  timestamp: z.number().describe("Unix timestamp in milliseconds"),
  temperature: z.number().describe("Temperature in Fahrenheit"),
  humidity: z.number().describe("Humidity percentage"),
  pressure: z.number().describe("Pressure in Pascals"),
});

export const DiagnosticMetricsSchema = z.object({
  current: z.object({
    temperature: z.number().describe("Current temperature in Fahrenheit"),
    humidity: z.number().describe("Current humidity percentage"),
    pressure: z.number().describe("Current pressure in Pascals"),
  }),
  rollingAverage: z.object({
    temperature: z
      .number()
      .describe("Rolling average temperature in Fahrenheit"),
    humidity: z.number().describe("Rolling average humidity percentage"),
    pressure: z.number().describe("Rolling average pressure in Pascals"),
  }),
  anomalyDetected: z.boolean().describe("Indicates if an anomaly was detected"),
});
