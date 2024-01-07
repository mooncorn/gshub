import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { minecraftServerManager } from "../../../app";
import { NotFoundError } from "../../../lib/exceptions/not-found-error";

const router = express.Router();

router.get(
  "/minecraft-servers/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const server = minecraftServerManager.get(id);

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

export { router as minecraftGetOneRouter };
