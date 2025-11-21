import type { SensorEvent, DiagnosticMetrics } from "./types";

/**
 * HVAC service to ingest sensor events and provide diagnostics.
 */
export class HVACService {
  private events: SensorEvent[] = [];
  private readonly ROLLING_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  private readonly TEMP_ANOMALY_THRESHOLD = 95; // °F
  private readonly HUMIDITY_ANOMALY_THRESHOLD = 20; // %

  /**
   * Ingest a new sensor event
   */
  public ingestEvent(event: SensorEvent): void {
    // TODO: Implement event ingestion
  }

  /**
   * Get diagnostic metrics based on current and recent events
   */
  public getDiagnostics(): DiagnosticMetrics | null {
    // TODO: Implement diagnostics calculation
    return null;
  }

  /**
   * Get the count of stored events (for debugging/monitoring)
   */
  public getEventCount(): number {
    // TODO: Implement event count retrieval
    return 0;
  }
}
