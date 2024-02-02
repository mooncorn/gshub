import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { docker } from "../../../app";
import { config } from "../../../config";

const router = express.Router();

router.get(
  "/servers/",
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    const containers = docker.list((c) => c.image !== config.minecraft.image);

    const results = containers.map((c) => ({
      id: c.id,
      name: c.name,
      running: c.running,
      hasVolumeBinds: !!c.volumeBinds,
    }));

    res.json(results);
  }
);

export { router as serversGetAllRouter };
