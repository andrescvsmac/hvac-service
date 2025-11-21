import express, { type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

/**
 * POST /ingest
 * Ingest a new HVAC sensor event
 */
app.post("/ingest", (req: Request, res: Response) => {
  try {
    // 1. Validate required fields
    // 2. Ingest event

    res.status(201).json({
      message: "Event ingested successfully",
      eventCount: 0,
    });
  } catch (error) {
    console.error("Error ingesting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /diagnostics
 * Get aggregated HVAC sensor diagnostics
 */
app.get("/diagnostics", (req: Request, res: Response) => {
  try {
    // 1. Get diagnostics from service
    res.status(404).json({
      error: "No sensor data available",
    });
  } catch (error) {
    console.error("Error getting diagnostics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    eventCount: 0,
  });
});

export function startServer() {
  app.listen(PORT, () => {
    console.log(`HVAC Sensor Service running on port ${PORT}`);
  });
}

export default app;
