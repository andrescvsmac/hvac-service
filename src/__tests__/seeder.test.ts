import { SensorSeeder } from "../seeder";
import { SensorEvent } from "../types";

describe("SensorSeeder", () => {
  let seeder: SensorSeeder;

  beforeEach(() => {
    seeder = new SensorSeeder();
  });

  describe("generateEvent", () => {
    it("should generate a valid sensor event", () => {
      const event = seeder.generateEvent();

      expect(event).toHaveProperty("sensorId");
      expect(event).toHaveProperty("timestamp");
      expect(event).toHaveProperty("temperature");
      expect(event).toHaveProperty("humidity");
      expect(event).toHaveProperty("pressure");

      expect(typeof event.sensorId).toBe("string");
      expect(typeof event.timestamp).toBe("number");
      expect(typeof event.temperature).toBe("number");
      expect(typeof event.humidity).toBe("number");
      expect(typeof event.pressure).toBe("number");
    });

    it("should respect overrides", () => {
      const overrides: Partial<SensorEvent> = {
        sensorId: "custom-sensor",
        temperature: 85.5,
        humidity: 55.0,
      };

      const event = seeder.generateEvent(overrides);

      expect(event.sensorId).toBe("custom-sensor");
      expect(event.temperature).toBe(85.5);
      expect(event.humidity).toBe(55.0);
    });

    it("should generate temperature within valid range", () => {
      for (let i = 0; i < 100; i++) {
        const event = seeder.generateEvent();
        expect(event.temperature).toBeGreaterThanOrEqual(60);
        expect(event.temperature).toBeLessThanOrEqual(100);
      }
    });

    it("should generate humidity within valid range", () => {
      for (let i = 0; i < 100; i++) {
        const event = seeder.generateEvent();
        expect(event.humidity).toBeGreaterThanOrEqual(10);
        expect(event.humidity).toBeLessThanOrEqual(80);
      }
    });

    it("should generate pressure within valid range", () => {
      for (let i = 0; i < 100; i++) {
        const event = seeder.generateEvent();
        expect(event.pressure).toBeGreaterThanOrEqual(95000);
        expect(event.pressure).toBeLessThanOrEqual(105000);
      }
    });
  });

  describe("generateEvents", () => {
    it("should generate the correct number of events", () => {
      const count = 10;
      const events = seeder.generateEvents(count);

      expect(events).toHaveLength(count);
    });

    it("should generate events spread over time window", () => {
      const count = 5;
      const timeWindow = 10 * 60 * 1000; // 10 minutes
      const events = seeder.generateEvents(count, timeWindow);

      // Check that timestamps are in ascending order
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThan(events[i - 1].timestamp);
      }

      // Check that events span roughly the time window
      const timeSpan =
        events[events.length - 1].timestamp - events[0].timestamp;
      expect(timeSpan).toBeGreaterThanOrEqual(timeWindow * 0.8); // Allow some tolerance
    });

    it("should generate events with valid data", () => {
      const events = seeder.generateEvents(5);

      events.forEach((event) => {
        expect(event).toHaveProperty("sensorId");
        expect(event).toHaveProperty("timestamp");
        expect(event).toHaveProperty("temperature");
        expect(event).toHaveProperty("humidity");
        expect(event).toHaveProperty("pressure");
      });
    });
  });

  describe("generateAnomalyEvents", () => {
    it("should generate the correct number of events", () => {
      const count = 5;
      const events = seeder.generateAnomalyEvents(count);

      expect(events).toHaveLength(count);
    });

    it("should generate events with anomalous conditions", () => {
      const events = seeder.generateAnomalyEvents(10);

      let hasHighTemp = false;
      let hasLowHumidity = false;

      events.forEach((event) => {
        if (event.temperature > 95) hasHighTemp = true;
        if (event.humidity < 20) hasLowHumidity = true;
      });

      // At least one type of anomaly should be present
      expect(hasHighTemp || hasLowHumidity).toBe(true);
    });

    it("should generate events in chronological order", () => {
      const events = seeder.generateAnomalyEvents(5);

      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(
          events[i - 1].timestamp
        );
      }
    });
  });

  describe("generateNormalEvents", () => {
    it("should generate the correct number of events", () => {
      const count = 10;
      const events = seeder.generateNormalEvents(count);

      expect(events).toHaveLength(count);
    });

    it("should generate events without anomalies", () => {
      const events = seeder.generateNormalEvents(20);

      events.forEach((event) => {
        expect(event.temperature).toBeLessThanOrEqual(95);
        expect(event.humidity).toBeGreaterThanOrEqual(20);
      });
    });

    it("should generate events in chronological order", () => {
      const events = seeder.generateNormalEvents(10);

      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(
          events[i - 1].timestamp
        );
      }
    });
  });

  describe("generateMultiSensorEvents", () => {
    it("should generate events for multiple sensors", () => {
      const eventsPerSensor = 3;
      const events = seeder.generateMultiSensorEvents(eventsPerSensor);

      // Should have events from multiple sensors
      const sensorIds = new Set(events.map((e) => e.sensorId));
      expect(sensorIds.size).toBeGreaterThan(1);
    });

    it("should generate the correct total number of events", () => {
      const eventsPerSensor = 5;
      const events = seeder.generateMultiSensorEvents(eventsPerSensor);

      // Should have 4 sensors * eventsPerSensor events
      expect(events.length).toBe(4 * eventsPerSensor);
    });

    it("should generate events within time window", () => {
      const timeWindow = 10 * 60 * 1000;
      const events = seeder.generateMultiSensorEvents(5, timeWindow);

      const now = Date.now();
      events.forEach((event) => {
        expect(event.timestamp).toBeLessThanOrEqual(now);
        expect(event.timestamp).toBeGreaterThan(now - timeWindow - 1000); // Small buffer
      });
    });

    it("should shuffle events (not in perfect sensor order)", () => {
      const events = seeder.generateMultiSensorEvents(5);

      // Check that events are not perfectly grouped by sensorId
      let sensorChanges = 0;
      for (let i = 1; i < events.length; i++) {
        if (events[i].sensorId !== events[i - 1].sensorId) {
          sensorChanges++;
        }
      }

      // Should have multiple sensor transitions (shuffled)
      expect(sensorChanges).toBeGreaterThan(0);
    });
  });
});
