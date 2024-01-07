import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { minecraftServerManager } from "../../../app";

const router = express.Router();

router.get(
  "/minecraft-servers/",
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    const servers = minecraftServerManager.list();

    const results = servers.map((server) => ({
      id: server.id,
      name: server.name,
      running: server.running,
      files: !!server.files,
      type: server.type,
      version: server.version,
    }));

    res.json(results);
  }
);

export { router as minecraftGetAllRouter };
