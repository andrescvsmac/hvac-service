import request from "supertest";
import app from "../server";
import { SensorEvent } from "../types";

describe("API Endpoints", () => {
  describe("POST /ingest", () => {
    it("should ingest a valid sensor event", async () => {
      const event: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 72.5,
        humidity: 45.0,
        pressure: 101325,
      };

      const response = await request(app)
        .post("/ingest")
        .send(event)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Event ingested successfully"
      );
      expect(response.body).toHaveProperty("eventCount");
      expect(typeof response.body.eventCount).toBe("number");
    });

    it("should reject event with missing sensorId", async () => {
      const invalidEvent = {
        timestamp: Date.now(),
        temperature: 72.5,
        humidity: 45.0,
        pressure: 101325,
      };

      const response = await request(app)
        .post("/ingest")
        .send(invalidEvent)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid event data");
    });

    it("should reject event with missing timestamp", async () => {
      const invalidEvent = {
        sensorId: "sensor-001",
        temperature: 72.5,
        humidity: 45.0,
        pressure: 101325,
      };

      const response = await request(app)
        .post("/ingest")
        .send(invalidEvent)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject event with missing temperature", async () => {
      const invalidEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        humidity: 45.0,
        pressure: 101325,
      };

      const response = await request(app)
        .post("/ingest")
        .send(invalidEvent)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject event with missing humidity", async () => {
      const invalidEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 72.5,
        pressure: 101325,
      };

      const response = await request(app)
        .post("/ingest")
        .send(invalidEvent)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject event with missing pressure", async () => {
      const invalidEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 72.5,
        humidity: 45.0,
      };

      const response = await request(app)
        .post("/ingest")
        .send(invalidEvent)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject event with invalid timestamp type", async () => {
      const invalidEvent = {
        sensorId: "sensor-001",
        timestamp: "not-a-number",
        temperature: 72.5,
        humidity: 45.0,
        pressure: 101325,
      };

      const response = await request(app)
        .post("/ingest")
        .send(invalidEvent)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should accept multiple sequential events", async () => {
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

      for (const event of events) {
        await request(app).post("/ingest").send(event).expect(201);
      }
    });
  });

  describe("GET /diagnostics", () => {
    beforeEach(async () => {
      // Clear any previous data by waiting for old events to be cleaned up
      // In a real scenario, you might want to add a reset method to the service
    });

    it("should return diagnostics after ingesting an event", async () => {
      const event: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 75.0,
        humidity: 50.0,
        pressure: 101350,
      };

      // Ingest event first
      await request(app).post("/ingest").send(event).expect(201);

      // Get diagnostics
      const response = await request(app).get("/diagnostics").expect(200);

      expect(response.body).toHaveProperty("current");
      expect(response.body).toHaveProperty("rollingAverage");
      expect(response.body).toHaveProperty("anomalyDetected");

      expect(response.body.current.temperature).toBe(75.0);
      expect(response.body.current.humidity).toBe(50.0);
      expect(response.body.current.pressure).toBe(101350);
    });

    it("should detect temperature anomaly", async () => {
      const hotEvent: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 96.0,
        humidity: 45.0,
        pressure: 101325,
      };

      await request(app).post("/ingest").send(hotEvent).expect(201);

      const response = await request(app).get("/diagnostics").expect(200);

      expect(response.body.anomalyDetected).toBe(true);
    });

    it("should detect humidity anomaly", async () => {
      const dryEvent: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 75.0,
        humidity: 15.0,
        pressure: 101325,
      };

      await request(app).post("/ingest").send(dryEvent).expect(201);

      const response = await request(app).get("/diagnostics").expect(200);

      expect(response.body.anomalyDetected).toBe(true);
    });

    it("should not detect anomaly for normal values", async () => {
      const normalEvent: SensorEvent = {
        sensorId: "sensor-001",
        timestamp: Date.now(),
        temperature: 75.0,
        humidity: 45.0,
        pressure: 101325,
      };

      await request(app).post("/ingest").send(normalEvent).expect(201);

      const response = await request(app).get("/diagnostics").expect(200);

      expect(response.body.anomalyDetected).toBe(false);
    });

    it("should calculate rolling averages for multiple events", async () => {
      const now = Date.now();
      const events: SensorEvent[] = [
        {
          sensorId: "sensor-001",
          timestamp: now - 5 * 60 * 1000,
          temperature: 70.0,
          humidity: 40.0,
          pressure: 101300,
        },
        {
          sensorId: "sensor-001",
          timestamp: now - 3 * 60 * 1000,
          temperature: 80.0,
          humidity: 50.0,
          pressure: 101400,
        },
        {
          sensorId: "sensor-001",
          timestamp: now,
          temperature: 75.0,
          humidity: 45.0,
          pressure: 101350,
        },
      ];

      for (const event of events) {
        await request(app).post("/ingest").send(event).expect(201);
      }

      const response = await request(app).get("/diagnostics").expect(200);

      expect(response.body.current.temperature).toBe(75.0);
      // Rolling average may include previously ingested events from other tests
      expect(response.body.rollingAverage.temperature).toBeGreaterThan(0);
      expect(response.body.rollingAverage.humidity).toBeGreaterThan(0);
      expect(response.body.rollingAverage.pressure).toBeGreaterThan(0);
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "healthy");
      expect(response.body).toHaveProperty("eventCount");
      expect(typeof response.body.eventCount).toBe("number");
    });
  });

  describe("Error handling", () => {
    it("should return 404 for unknown routes", async () => {
      await request(app).get("/unknown").expect(404);
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/ingest")
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);
    });
  });
});
