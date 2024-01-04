import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { minecraftServerManager } from "../../../app";
import { ContainerStatus } from "../../../lib/container-controller";
import { BadRequestError } from "../../../lib/exceptions/api/bad-request-error";
import { requireAuth } from "../../../middleware/require-auth";

const router = express.Router();

router.get(
  "/api/minecraft/servers/:id/players",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const server = minecraftServerManager.getServer(id);

    if (server.controller.status === ContainerStatus.OFFLINE)
      throw new BadRequestError(
        "Server has to be online to check player count"
      );

    res.json({ status: { players: server.playerCount } });
  }
);

export { router as minecraftPlayersRouter };
