import type { z } from "zod";

import { DiagnosticMetricsSchema, SensorEventSchema } from "./schema";

export type SensorEvent = z.infer<typeof SensorEventSchema>;

export type DiagnosticMetrics = z.infer<typeof DiagnosticMetricsSchema>;
