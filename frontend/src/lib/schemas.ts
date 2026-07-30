/**
 * Zod schemas mirroring backend Pydantic models
 * (`backend/src/app/models/schemas.py`). Keep in sync.
 */
import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  message: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
