import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  CONTAINERS_DIR: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
});

export const env = envSchema.parse(process.env);
