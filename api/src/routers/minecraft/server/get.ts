import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { minecraftServerManager } from "../../../app";
import { requireAuth } from "../../../middleware/require-auth";

const router = express.Router();

router.get(
  "/api/minecraft/servers/:id",
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    minecraftServerManager.res.json({
      servers: minecraftServerManager.serverList.servers.map((s) => {
        return {
          id: s.controller.id,
          name: s.controller.name,
          status: s.status,
        };
      }),
    });
  }
);

export { router as minecraftListRouter };
