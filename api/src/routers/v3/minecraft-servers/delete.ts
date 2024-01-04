import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { minecraftServerManager } from "../../../app";

const router = express.Router();

router.delete(
  "/minecraft-servers/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const server = await minecraftServerManager.delete(id);

    res.json({
      id: server.id,
      name: server.name,
    });
  }
);

export { router as minecraftDeleteRouter };
