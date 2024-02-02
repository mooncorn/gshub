import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { docker } from "../../../app";

const router = express.Router();

router.get(
  "/servers/minecraft/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const container = docker.getContainer(id);

    res.json({
      id: container.id,
      name: container.name,
      running: container.running,
      env: container.env,
      portBinds: container.portBinds,
      volumeBinds: container.volumeBinds,
    });
  }
);

export { router as minecraftGetOneRouter };
