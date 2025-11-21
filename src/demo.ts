#!/usr/bin/env ts-node

/**
 * Example script demonstrating how to use the HVAC Sensor Service
 * Run with: npm run seed-api
 */

import { SensorSeeder } from "./seeder";
import type { SensorEvent, DiagnosticMetrics } from "./types";

const BASE_URL = "http://localhost:3000";

interface IngestResponse {
  message: string;
  eventCount: number;
}

async function ingestEvent(event: SensorEvent): Promise<IngestResponse> {
  const response = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return response.json() as Promise<IngestResponse>;
}

async function getDiagnostics(): Promise<DiagnosticMetrics> {
  const response = await fetch(`${BASE_URL}/diagnostics`);
  return response.json() as Promise<DiagnosticMetrics>;
}

async function main() {
  console.log("🌡️  HVAC Sensor Service - API Demo\n");

  const seeder = new SensorSeeder();

  // Generate and ingest normal events
  console.log("📊 Ingesting normal sensor events...");
  const normalEvents = seeder.generateNormalEvents(5);

  for (const event of normalEvents) {
    const result = await ingestEvent(event);
    console.log(
      `  ✓ Ingested event from ${event.sensorId} (count: ${result.eventCount})`
    );
  }

  // Get diagnostics for normal conditions
  console.log("\n📈 Diagnostics (Normal Conditions):");
  let diagnostics = await getDiagnostics();
  console.log(JSON.stringify(diagnostics, null, 2));

  // Simulate an anomaly
  console.log("\n🚨 Simulating temperature anomaly...");
  const hotEvent = seeder.generateEvent({
    temperature: 98.0,
    humidity: 45.0,
  });
  await ingestEvent(hotEvent);

  diagnostics = await getDiagnostics();
  console.log("\n📈 Diagnostics (After Anomaly):");
  console.log(JSON.stringify(diagnostics, null, 2));

  if (diagnostics.anomalyDetected) {
    console.log("\n⚠️  ANOMALY DETECTED! System requires attention.");
  }

  console.log("\n✅ Demo complete!");
}

// Only run if executed directly
main().catch((error) => {
  console.error("❌ Error:", error.message);
  console.log("\n💡 Make sure the server is running: npm run dev");
  process.exit(1);
});
