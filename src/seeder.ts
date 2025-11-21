import type { SensorEvent } from "./types";

export class SensorSeeder {
  private readonly sensorIds = [
    "sensor-001",
    "sensor-002",
    "sensor-003",
    "sensor-004",
  ];

  /**
   * Generate a random sensor event
   */
  public generateEvent(overrides?: Partial<SensorEvent>): SensorEvent {
    return {
      sensorId: overrides?.sensorId || this.randomSensorId(),
      timestamp: overrides?.timestamp || Date.now(),
      temperature: overrides?.temperature ?? this.randomTemperature(),
      humidity: overrides?.humidity ?? this.randomHumidity(),
      pressure: overrides?.pressure ?? this.randomPressure(),
    };
  }

  /**
   * Generate multiple events over a time period
   */
  public generateEvents(
    count: number,
    timeWindowMs: number = 15 * 60 * 1000 // 15 minutes default
  ): SensorEvent[] {
    const events: SensorEvent[] = [];
    const now = Date.now();
    const interval = timeWindowMs / count;

    for (let i = 0; i < count; i++) {
      const timestamp = now - timeWindowMs + i * interval;
      events.push(this.generateEvent({ timestamp }));
    }

    return events;
  }

  /**
   * Generate events with anomalies
   */
  public generateAnomalyEvents(count: number = 5): SensorEvent[] {
    const events: SensorEvent[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const isHotAnomaly = i % 2 === 0;
      events.push(
        this.generateEvent({
          timestamp: now - (count - i) * 60000, // Space events 1 minute apart
          temperature: isHotAnomaly
            ? 96 + Math.random() * 5
            : 70 + Math.random() * 10,
          humidity: isHotAnomaly
            ? 25 + Math.random() * 10
            : 15 + Math.random() * 3,
        })
      );
    }

    return events;
  }

  /**
   * Generate normal (non-anomalous) events
   */
  public generateNormalEvents(count: number = 10): SensorEvent[] {
    const events: SensorEvent[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      events.push(
        this.generateEvent({
          timestamp: now - (count - i) * 60000,
          temperature: 70 + Math.random() * 15, // 70-85°F
          humidity: 30 + Math.random() * 30, // 30-60%
        })
      );
    }

    return events;
  }

  /**
   * Generate events across different sensors
   */
  public generateMultiSensorEvents(
    eventsPerSensor: number = 5,
    timeWindowMs: number = 10 * 60 * 1000
  ): SensorEvent[] {
    const allEvents: SensorEvent[] = [];
    const interval = timeWindowMs / eventsPerSensor;
    const now = Date.now();

    this.sensorIds.forEach((sensorId) => {
      for (let i = 0; i < eventsPerSensor; i++) {
        const timestamp = now - timeWindowMs + i * interval;
        allEvents.push(
          this.generateEvent({
            sensorId,
            timestamp,
          })
        );
      }
    });

    // Shuffle to simulate real-world arrival order
    return this.shuffleArray(allEvents);
  }

  private randomSensorId(): string {
    return this.sensorIds[Math.floor(Math.random() * this.sensorIds.length)];
  }

  private randomTemperature(): number {
    // Range: 60-100°F
    return Math.round((60 + Math.random() * 40) * 10) / 10;
  }

  private randomHumidity(): number {
    // Range: 10-80%
    return Math.round((10 + Math.random() * 70) * 10) / 10;
  }

  private randomPressure(): number {
    // Range: 95000-105000 Pascals (typical atmospheric pressure range)
    return Math.round(95000 + Math.random() * 10000);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
