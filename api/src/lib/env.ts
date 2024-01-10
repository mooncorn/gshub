import { z } from "zod";

export const env = {
  CONTAINERS_DIR: z.string().min(1).parse(process.env.CONTAINERS_DIR),
  NEXTAUTH_SECRET: z.string().min(1).parse(process.env.NEXTAUTH_SECRET),
  CORS_ORIGIN: z.string().min(1).parse(process.env.CORS_ORIGIN),
};
