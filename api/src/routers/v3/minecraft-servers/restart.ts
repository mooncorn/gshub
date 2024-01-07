import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { minecraftServerManager } from "../../../app";

const router = express.Router();

router.post(
  "/minecraft-servers/:id/restart",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const server = await minecraftServerManager.restart(id);

    const files: boolean = !!server.files;

    res.json({
      id: server.id,
      name: server.name,
      running: server.running,
      files,
      type: server.type,
      version: server.version,
    });
  }
);

export { router as minecraftRestartRouter };
