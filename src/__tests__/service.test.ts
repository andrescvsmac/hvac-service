import { HVACService } from "../service";
import type { SensorEvent } from "../types";

describe("HVACService", () => {
  let service: HVACService;

  beforeEach(() => {
    service = new HVACService();
  });

  describe("ingestEvent", () => {
    it("should ingest a single event", () => {
      const event: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 72.5,
        humidity: 45.0,
        pressure: 101325,
      };

      service.ingestEvent(event);
      expect(service.getEventCount()).toBe(1);
    });

    it("should ingest multiple events", () => {
      const events: SensorEvent[] = [
        {
          sensorId: "sensor-001",
          timestamp: Date.now(),
          temperature: 72.5,
          humidity: 45.0,
          pressure: 101325,
        },
        {
          sensorId: "sensor-002",
          timestamp: Date.now(),
          temperature: 73.0,
          humidity: 46.0,
          pressure: 101330,
        },
      ];

      events.forEach((event) => service.ingestEvent(event));
      expect(service.getEventCount()).toBe(2);
    });

    it("should cleanup events older than 10 minutes", () => {
      const now = Date.now();
      const oldEvent: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: now - 11 * 60 * 1000, // 11 minutes ago
        temperature: 70.0,
        humidity: 40.0,
        pressure: 101300,
      };

      const recentEvent: SensorEvent = {
        sensorId: "sensor-002",
        timestamp: now,
        temperature: 75.0,
        humidity: 50.0,
        pressure: 101350,
      };

      service.ingestEvent(oldEvent);
      service.ingestEvent(recentEvent);

      // Old event should be cleaned up, only recent event remains
      expect(service.getEventCount()).toBe(1);
    });
  });

  describe("getDiagnostics", () => {
    it("should return null when no events exist", () => {
      const diagnostics = service.getDiagnostics();
      expect(diagnostics).toBeNull();
    });

    it("should return current values from the latest event", () => {
      const now = Date.now();

      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now - 5000,
        temperature: 70.0,
        humidity: 40.0,
        pressure: 101300,
      });

      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now,
        temperature: 75.0,
        humidity: 50.0,
        pressure: 101350,
      });

      const diagnostics = service.getDiagnostics();

      expect(diagnostics?.current).toEqual({
        temperature: 75.0,
        humidity: 50.0,
        pressure: 101350,
      });
    });

    it("should calculate rolling averages correctly", () => {
      const now = Date.now();

      // Add 3 events within 10-minute window
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now - 5 * 60 * 1000,
        temperature: 70.0,
        humidity: 40.0,
        pressure: 101300,
      });

      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now - 3 * 60 * 1000,
        temperature: 80.0,
        humidity: 50.0,
        pressure: 101400,
      });

      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now,
        temperature: 75.0,
        humidity: 45.0,
        pressure: 101350,
      });

      const diagnostics = service.getDiagnostics();

      // Average: (70 + 80 + 75) / 3 = 75
      expect(diagnostics?.rollingAverage.temperature).toBe(75);
      // Average: (40 + 50 + 45) / 3 = 45
      expect(diagnostics?.rollingAverage.humidity).toBe(45);
      // Average: (101300 + 101400 + 101350) / 3 = 101350
      expect(diagnostics?.rollingAverage.pressure).toBe(101350);
    });

    it("should detect temperature anomaly when > 95°F", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 96.0,
        humidity: 45.0,
        pressure: 101325,
      });

      const diagnostics = service.getDiagnostics();
      expect(diagnostics?.anomalyDetected).toBe(true);
    });

    it("should detect humidity anomaly when < 20%", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 75.0,
        humidity: 19.0,
        pressure: 101325,
      });

      const diagnostics = service.getDiagnostics();
      expect(diagnostics?.anomalyDetected).toBe(true);
    });

    it("should not detect anomaly for normal values", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 75.0,
        humidity: 45.0,
        pressure: 101325,
      });

      const diagnostics = service.getDiagnostics();
      expect(diagnostics?.anomalyDetected).toBe(false);
    });

    it("should detect anomaly when both conditions are met", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 96.0,
        humidity: 15.0,
        pressure: 101325,
      });

      const diagnostics = service.getDiagnostics();
      expect(diagnostics?.anomalyDetected).toBe(true);
    });

    it("should handle edge case: temperature exactly at 95°F", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 95.0,
        humidity: 45.0,
        pressure: 101325,
      });

      const diagnostics = service.getDiagnostics();
      expect(diagnostics?.anomalyDetected).toBe(false);
    });

    it("should handle edge case: humidity exactly at 20%", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 75.0,
        humidity: 20.0,
        pressure: 101325,
      });

      const diagnostics = service.getDiagnostics();
      expect(diagnostics?.anomalyDetected).toBe(false);
    });

    it("should only include events within 10-minute window for rolling average", () => {
      const now = Date.now();

      // Event outside window (11 minutes ago)
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now - 11 * 60 * 1000,
        temperature: 100.0, // Should not affect average
        humidity: 10.0,
        pressure: 100000,
      });

      // Event within window
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now - 5 * 60 * 1000,
        temperature: 70.0,
        humidity: 40.0,
        pressure: 101300,
      });

      // Latest event
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now,
        temperature: 80.0,
        humidity: 50.0,
        pressure: 101400,
      });

      const diagnostics = service.getDiagnostics();

      // Should only average the 2 recent events: (70 + 80) / 2 = 75
      expect(diagnostics?.rollingAverage.temperature).toBe(75);
      expect(diagnostics?.rollingAverage.humidity).toBe(45);
      expect(diagnostics?.rollingAverage.pressure).toBe(101350);
    });

    it("should round rolling averages to 2 decimal places", () => {
      const now = Date.now();

      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now - 2 * 60 * 1000,
        temperature: 72.333,
        humidity: 44.666,
        pressure: 101325,
      });

      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: now,
        temperature: 73.666,
        humidity: 45.333,
        pressure: 101335,
      });

      const diagnostics = service.getDiagnostics();

      // Average: (72.333 + 73.666) / 2 = 72.9995 -> 73.00
      expect(diagnostics?.rollingAverage.temperature).toBe(73);
      // Average: (44.666 + 45.333) / 2 = 44.9995 -> 45.00
      expect(diagnostics?.rollingAverage.humidity).toBe(45);
    });
  });

  describe("getEventCount", () => {
    it("should return 0 for new service", () => {
      expect(service.getEventCount()).toBe(0);
    });

    it("should return correct count after ingesting events", () => {
      service.ingestEvent({
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 72.5,
        humidity: 45.0,
        pressure: 101325,
      });

      service.ingestEvent({
        sensorId: "sensor-002",
        timestamp: Date.now(),
        temperature: 73.0,
        humidity: 46.0,
        pressure: 101330,
      });

      expect(service.getEventCount()).toBe(2);
    });
  });
});
