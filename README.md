# HVAC Sensor Service

A Node.js + TypeScript backend service for ingesting HVAC sensor events and providing real-time aggregated diagnostic snapshots.

## Structure

```sh
.
├── src
│   ├── __tests__
│   │   ├── seeder.test.ts
│   │   ├── server.test.ts
│   │   └── service.test.ts
│   ├── demo.ts
│   ├── index.ts
│   ├── schema.ts
│   ├── seeder.ts
│   ├── server.ts
│   ├── service.ts
│   └── types.ts
├── jest.config.js
├── package-lock.json
├── package.json
├── PROJECT_STRUCTURE.md
├── README.md
├── service.solution.txt
└── tsconfig.json
```

- `src/__tests__/`: Unit and integration tests for the service
- `src/demo.ts`: Example script demonstrating API usage
- `src/index.ts`: Application entry point
- `src/schema.ts`: Zod schemas for request validation
- `src/seeder.ts`: Utility for generating test sensor data
- `src/server.ts`: Express REST API with endpoints for ingestion and diagnostics retrieval
- `src/service.ts`: Core business logic for event ingestion, rolling averages, and anomaly detection
- `src/types.ts`: Type definitions for sensor events and diagnostics metrics
- `jest.config.js`: Jest configuration for testing
- `package-lock.json`: Auto-generated lock file for dependencies
- `package.json`: Project dependencies and scripts
- `README.md`: Project documentation
- `tsconfig.json`: TypeScript configuration

## Installation

```bash
npm install
```

## Usage

### Development Mode

```bash
npm run dev
```

The server runs on port 3000 by default (configurable via `PORT` environment variable).

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Demo

```bash
# Run API demo (requires server to be running)
npm run demo
```

## Part 1: Implement the HVAC Sensor Service

Implement a service in (`src/service.ts`) that ingests HVAC sensor events and provides aggregated diagnostic metrics.

Methods to implement:

- `ingestEvent(event: SensorEvent): void`: Ingest a new sensor event
- `getDiagnostics(): DiagnosticMetrics | null`: Get aggregated diagnostic metrics
- `getEventCount(): number`: Get the count of stored events (for debugging/monitoring)

> **NOTE**: If no events have been ingested yet, `getDiagnostics` should return `null`.

### Ingestion

Store events in-memory with automatic cleanup of events older than 10 minutes.

> **NOTE**: Simple in-memory storage is sufficient; no database integration is required.

### Current Metrics and Rolling Averages

Compute current metrics based on the latest event, use events within the last 10 minutes for rolling averages.

### Anomaly Detection Rules

- **Temperature Anomaly**: Temperature > 95°F
- **Humidity Anomaly**: Humidity < 20%

## Part 2: Implement API Endpoints

Implement REST API endpoints in (`src/server.ts`) using Express.

- `POST /ingest`: Ingest a new sensor event
- `GET /diagnostics`: Retrieve aggregated diagnostic metrics
- `GET /health`: Health check endpoint

For each endpoint, implement request validation, response formatting, and error handling.

### POST /ingest

Ingest a new HVAC sensor event.

**Request Body:**

```json
{
  "sensorId": "sensor-001",
  "timestamp": 1700000000000,
  "temperature": 72.5,
  "humidity": 45.0,
  "pressure": 101325
}
```

**Response:**

```json
{
  "message": "Event ingested successfully",
  "eventCount": 42
}
```

> **NOTE**: `eventCount` indicates the total number of stored events after ingestion.

### GET /diagnostics

Get aggregated diagnostic metrics.

**Response:**

```json
{
  "current": {
    "temperature": 72.5,
    "humidity": 45.0,
    "pressure": 101325
  },
  "rollingAverage": {
    "temperature": 71.8,
    "humidity": 46.2,
    "pressure": 101320
  },
  "anomalyDetected": false
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "eventCount": 42
}
```

> **NOTE**: `eventCount` indicates the total number of stored events.
